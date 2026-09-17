// Reads the live state of every deployed Safix pool and writes it to
// data/protocol/onchain/<network>.json. Every number on the parameter and
// address pages comes from this file, so nothing on those pages is typed by
// hand or kept in sync manually.
//
//   npm run sync:chain
//
// Networks without a deployment record are skipped; the pages render their
// "not deployed yet" state from the absence of the file.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createPublicClient, http } from "viem"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const protocolDir = join(docsRoot, "data", "protocol")
const onchainDir = join(protocolDir, "onchain")

const fail = message => {
  console.error(`snapshot-chain: ${message}`)
  process.exit(1)
}

const readJson = path => JSON.parse(readFileSync(path, "utf8"))

const poolAbi = readJson(join(protocolDir, "abi", "SafixPool.json"))
const registryAbi = readJson(join(protocolDir, "abi", "PassportRegistry.json"))
const deskAbi = readJson(join(protocolDir, "abi", "PartnershipDesk.json"))
const erc20Abi = readJson(join(protocolDir, "abi", "IERC20.json"))
const feedAbi = readJson(join(protocolDir, "abi", "IAggregatorV3.json"))
const networks = readJson(join(protocolDir, "networks.json"))

const metadataAbi = [
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] }
]

// Chainlink aggregators expose a human description ("NVDA / USD") that the
// protocol's own interface does not need but the parameter reference does.
const feedDescriptionAbi = [
  { type: "function", name: "description", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] }
]

// Reading can be pointed at a different endpoint than the one published on the
// addresses page, which is how the pipeline is verified against a local node
// before a public deployment exists: SAFIX_RPC_TESTNET=http://127.0.0.1:8545
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const rpcUrlFor = network => process.env[`SAFIX_RPC_${network.key.toUpperCase()}`] ?? network.rpcUrl

const stringify = value =>
  JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), 2)

async function safeRead(client, call) {
  try {
    return await client.readContract(call)
  } catch {
    return null
  }
}

async function tokenMetadata(client, address) {
  const [symbol, name, decimals] = await Promise.all([
    safeRead(client, { address, abi: metadataAbi, functionName: "symbol" }),
    safeRead(client, { address, abi: metadataAbi, functionName: "name" }),
    safeRead(client, { address, abi: erc20Abi, functionName: "decimals" })
  ])
  return { address, symbol, name, decimals: decimals === null ? null : Number(decimals) }
}

async function snapshotAsset(client, pool, asset) {
  const [config, feed, feedDecimals, price, guard] = await Promise.all([
    client.readContract({ address: pool, abi: poolAbi, functionName: "assetConfig", args: [asset] }),
    client.readContract({ address: pool, abi: poolAbi, functionName: "priceFeeds", args: [asset] }),
    client.readContract({ address: pool, abi: poolAbi, functionName: "priceFeedDecimals", args: [asset] }),
    safeRead(client, { address: pool, abi: poolAbi, functionName: "currentPrice", args: [asset] }),
    // The sanity bounds a price is held to. Per asset, because a treasury wrapper
    // and an equity do not go stale or move at the same rate. An older pool has no
    // guards at all, and the read fails there rather than answering zero.
    safeRead(client, { address: pool, abi: poolAbi, functionName: "priceGuards", args: [asset] })
  ])
  const [enabled, maxLtvBps, liqThresholdBps, priceUsd1e18] = config
  const hasFeed = feed !== ZERO_ADDRESS
  const feedDescription = hasFeed
    ? await safeRead(client, { address: feed, abi: feedDescriptionAbi, functionName: "description" })
    : null
  return {
    ...(await tokenMetadata(client, asset)),
    enabled,
    maxLtvBps: Number(maxLtvBps),
    liqThresholdBps: Number(liqThresholdBps),
    storedPriceUsd1e18: priceUsd1e18.toString(),
    priceFeed: hasFeed ? feed : null,
    priceFeedDecimals: hasFeed ? Number(feedDecimals) : null,
    priceSource: hasFeed ? "chainlink" : "manual",
    feedDescription,
    currentPriceUsd1e18: price ? price[0].toString() : null,
    priceUpdatedAt: price ? Number(price[1]) : null,
    maxPriceAgeSeconds: guard ? Number(guard[0]) : null,
    maxDeviationBps: guard ? Number(guard[1]) : null,
    minPriceUsd1e18: guard ? guard[2].toString() : null,
    maxPriceUsd1e18: guard ? guard[3].toString() : null
  }
}

async function snapshotPool(client, pool) {
  const read = functionName => client.readContract({ address: pool, abi: poolAbi, functionName })

  const [
    owner,
    priceUpdater,
    passportRegistry,
    stable,
    originationFeeBps,
    redemptionFeeBps,
    liquidationIncentiveBps,
    totalDeposits,
    availableLiquidity,
    protocolFees,
    productP,
    currentScale,
    assetCount
  ] = await Promise.all([
    read("owner"),
    read("priceUpdater"),
    read("passportRegistry"),
    read("stable"),
    read("originationFeeBps"),
    read("redemptionFeeBps"),
    read("liquidationIncentiveBps"),
    read("totalDeposits"),
    read("availableLiquidity"),
    read("protocolFees"),
    read("productP"),
    read("currentScale"),
    read("assetCount")
  ])

  const assets = []
  for (let index = 0n; index < assetCount; index += 1n) {
    const asset = await client.readContract({
      address: pool,
      abi: poolAbi,
      functionName: "assetList",
      args: [index]
    })
    assets.push(await snapshotAsset(client, pool, asset))
  }

  return {
    address: pool,
    owner,
    priceUpdater: priceUpdater === ZERO_ADDRESS ? null : priceUpdater,
    passportRegistry: passportRegistry === ZERO_ADDRESS ? null : passportRegistry,
    passportGate: passportRegistry !== ZERO_ADDRESS,
    stable: await tokenMetadata(client, stable),
    originationFeeBps: Number(originationFeeBps),
    redemptionFeeBps: Number(redemptionFeeBps),
    liquidationIncentiveBps: Number(liquidationIncentiveBps),
    totalDeposits: totalDeposits.toString(),
    availableLiquidity: availableLiquidity.toString(),
    protocolFees: protocolFees.toString(),
    productP: productP.toString(),
    currentScale: Number(currentScale),
    assets
  }
}

async function snapshotNetwork(network) {
  const deploymentPath = join(protocolDir, "deployments", `${network.key}.json`)
  if (!existsSync(deploymentPath)) {
    console.log(`network ${network.key}: no deployment record, nothing to read`)
    return null
  }
  const deployment = readJson(deploymentPath)
  const recorded = deployment.contracts?.SafixPool
  const poolAddress = typeof recorded === "string" ? recorded : recorded?.address
  if (!poolAddress) fail(`deployment record for ${network.key} carries no SafixPool address`)

  const rpcUrl = rpcUrlFor(network)
  const client = createPublicClient({ transport: http(rpcUrl) })
  const chainId = await client.getChainId()
  if (chainId !== network.chainId) {
    fail(`${rpcUrl} reports chain id ${chainId}, expected ${network.chainId}`)
  }

  const block = await client.getBlock()
  const pool = await snapshotPool(client, poolAddress)

  const registryAddress = deployment.contracts?.PassportRegistry
  const registry = registryAddress
    ? {
        address: registryAddress,
        owner: await safeRead(client, {
          address: registryAddress,
          abi: registryAbi,
          functionName: "owner"
        }),
        fullMask: Number(
          (await safeRead(client, {
            address: registryAddress,
            abi: registryAbi,
            functionName: "FULL_MASK"
          })) ?? 0
        )
      }
    : null

  const deskAddress = deployment.contracts?.PartnershipDesk
  const desk = deskAddress
    ? {
        address: deskAddress,
        owner: await safeRead(client, { address: deskAddress, abi: deskAbi, functionName: "owner" }),
        auditor: await safeRead(client, {
          address: deskAddress,
          abi: deskAbi,
          functionName: "auditor"
        }).then(value => (value === ZERO_ADDRESS ? null : value)),
        partnershipCount: Number(
          (await safeRead(client, {
            address: deskAddress,
            abi: deskAbi,
            functionName: "partnershipCount"
          })) ?? 0
        )
      }
    : null

  return {
    network: network.key,
    chainId,
    readAt: new Date().toISOString(),
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
    pool,
    registry,
    desk
  }
}

async function main() {
  mkdirSync(onchainDir, { recursive: true })
  for (const stale of readdirSync(onchainDir)) {
    if (!stale.endsWith(".json")) continue
    const key = stale.replace(/\.json$/, "")
    if (!existsSync(join(protocolDir, "deployments", `${key}.json`))) {
      rmSync(join(onchainDir, stale))
      console.log(`network ${key}: deployment record gone, dropped its snapshot`)
    }
  }
  for (const network of networks) {
    const snapshot = await snapshotNetwork(network)
    if (!snapshot) continue
    writeFileSync(join(onchainDir, `${network.key}.json`), `${stringify(snapshot)}\n`)
    console.log(
      `network ${network.key}: read pool ${snapshot.pool.address} at block ${snapshot.blockNumber}, ${snapshot.pool.assets.length} asset(s)`
    )
  }
}

main()
