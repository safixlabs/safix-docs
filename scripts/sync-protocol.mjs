// Generates data/protocol/** from the Safix protocol repositories.
// Nothing under data/protocol is written by hand: ABIs come from the Foundry
// build artifacts, the contract limits come from the Solidity source, the
// network list comes from foundry.toml plus the app's chain definitions, and
// the deployment records come from the protocol repo's deployment files.
//
//   npm run sync:protocol
//
// Override the checkout locations with SAFIX_REPO and SAFIX_APP_REPO.

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { getAddress } from "viem"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const protocolRepo = resolve(process.env.SAFIX_REPO ?? join(docsRoot, "..", "safix"))
const appRepo = resolve(process.env.SAFIX_APP_REPO ?? join(docsRoot, "..", "safix-app"))
const outDir = join(docsRoot, "data", "protocol")

const fail = message => {
  console.error(`sync-protocol: ${message}`)
  process.exit(1)
}

const readText = path => {
  if (!existsSync(path)) fail(`missing ${path}`)
  return readFileSync(path, "utf8")
}

const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

const git = (repo, ...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim()

// --- contract artifacts -----------------------------------------------------

const EXPORTED_CONTRACTS = [
  { name: "SafixPool", source: "src/SafixPool.sol" },
  { name: "PassportRegistry", source: "src/PassportRegistry.sol" },
  { name: "PartnershipDesk", source: "src/PartnershipDesk.sol" },
  { name: "IERC20", source: "src/interfaces/IERC20.sol" },
  { name: "IAggregatorV3", source: "src/interfaces/IAggregatorV3.sol" }
]

const contractsDir = join(protocolRepo, "contracts")

function buildContracts() {
  console.log("forge build")
  execFileSync("forge", ["build"], { cwd: contractsDir, stdio: "inherit" })
}

function readArtifact(name) {
  const path = join(contractsDir, "out", `${name}.sol`, `${name}.json`)
  if (!existsSync(path)) fail(`missing Foundry artifact ${path}; run forge build in ${contractsDir}`)
  return JSON.parse(readFileSync(path, "utf8"))
}

function exportAbis() {
  buildContracts()
  const abiDir = join(outDir, "abi")
  // The same ABIs are served from the docs site so an integrator can fetch them
  // straight off the documentation instead of asking for a copy.
  const publicAbiDir = join(docsRoot, "public", "abi")
  rmSync(abiDir, { recursive: true, force: true })
  rmSync(publicAbiDir, { recursive: true, force: true })
  const contracts = []
  for (const { name, source } of EXPORTED_CONTRACTS) {
    const artifact = readArtifact(name)
    const abi = artifact.abi
    if (!Array.isArray(abi) || abi.length === 0) fail(`artifact ${name} carries no ABI`)
    writeJson(join(abiDir, `${name}.json`), abi)
    writeJson(join(publicAbiDir, `${name}.json`), abi)
    const sourceText = readText(join(contractsDir, source))
    const license = sourceText.match(/SPDX-License-Identifier:\s*(\S+)/)?.[1] ?? null
    const pragma = sourceText.match(/pragma solidity\s+([^;]+);/)?.[1]?.trim() ?? null
    contracts.push({
      name,
      source: `contracts/${source}`,
      license,
      pragma,
      compiler: artifact.metadata?.compiler?.version ?? null,
      functions: abi.filter(item => item.type === "function").length,
      events: abi.filter(item => item.type === "event").length
    })
  }
  return contracts
}

// --- contract limits --------------------------------------------------------
// Read straight out of SafixPool.sol so the parameter reference can never drift
// from what the contract actually enforces.

function readLimits() {
  const source = readText(join(contractsDir, "src", "SafixPool.sol"))

  const grab = (label, pattern, transform = Number) => {
    const match = source.match(pattern)
    if (!match) fail(`could not read ${label} out of SafixPool.sol; the source shape changed`)
    return transform(match[1])
  }

  const bigintFromLiteral = raw => {
    const cleaned = raw.replace(/_/g, "").trim()
    const scientific = cleaned.match(/^(\d+)e(\d+)$/)
    if (scientific) return (BigInt(scientific[1]) * 10n ** BigInt(scientific[2])).toString()
    return BigInt(cleaned).toString()
  }

  return {
    bps: grab("BPS", /uint256 private constant BPS = ([\d_]+);/, raw => Number(raw.replace(/_/g, ""))),
    pPrecision: grab("P_PRECISION", /uint256 private constant P_PRECISION = ([^;]+);/, bigintFromLiteral),
    scaleFactor: grab("SCALE_FACTOR", /uint256 private constant SCALE_FACTOR = ([^;]+);/, bigintFromLiteral),
    defaults: {
      originationFeeBps: grab("origination default", /uint16 public originationFeeBps = (\d+);/),
      redemptionFeeBps: grab("redemption default", /uint16 public redemptionFeeBps = (\d+);/),
      liquidationIncentiveBps: grab("incentive default", /uint16 public liquidationIncentiveBps = (\d+);/)
    },
    maxOriginationFeeBps: grab(
      "setFees bound",
      /function setFees\([^)]*\)[^{]*\{\s*require\(originationBps <= (\d+)/
    ),
    maxRedemptionFeeBps: grab("setFees bound", /require\(originationBps <= \d+ && redemptionBps <= (\d+)/),
    maxLiquidationIncentiveBps: grab(
      "setLiquidationIncentive bound",
      /function setLiquidationIncentive\([^)]*\)[^{]*\{\s*require\(bps <= (\d+)/
    ),
    maxPriceFeedDecimals: grab("setPriceFeed bound", /require\(feedDecimals <= (\d+), "bad feed decimals"\)/),
    passport: readPassportMask()
  }
}

// The passport's complete mask is a contract constant, and the number of checks
// the documentation talks about is however many bits it sets.
function readPassportMask() {
  const source = readText(join(contractsDir, "src", "PassportRegistry.sol"))
  const raw = source.match(/uint8 public constant FULL_MASK = (0x[0-9a-fA-F]+|\d+);/)?.[1]
  if (!raw) fail("could not read FULL_MASK out of PassportRegistry.sol")
  const fullMask = Number(raw)
  const checks = fullMask.toString(2).split("").filter(bit => bit === "1").length
  return { fullMask, checks }
}

// --- keeper -----------------------------------------------------------------
// The keeper guide publishes the worker's real config shape and run commands,
// read from the worker itself rather than transcribed.

function readKeeper() {
  const keeperDir = join(protocolRepo, "keeper")
  if (!existsSync(keeperDir)) fail(`no keeper at ${keeperDir}`)
  const pkg = JSON.parse(readText(join(keeperDir, "package.json")))
  const example = JSON.parse(readText(join(keeperDir, "config.example.json")))
  const source = readText(join(keeperDir, "keeper.ts"))
  const abi = [...(source.match(/parseAbi\(\[([\s\S]*?)\]\)/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
    match => match[1]
  )
  if (abi.length === 0) fail("could not read the keeper's ABI out of keeper.ts")
  return {
    scripts: pkg.scripts ?? {},
    dependencies: pkg.dependencies ?? {},
    configFields: Object.keys(example),
    configExample: example,
    abi,
    defaultIntervalMs: Number(source.match(/config\.intervalMs \?\? ([\d_]+)/)?.[1]?.replace(/_/g, "") ?? 0)
  }
}

// --- test suite -------------------------------------------------------------

function readTestSuite() {
  const testDir = join(contractsDir, "test")
  if (!existsSync(testDir)) fail(`no test directory at ${testDir}`)
  const files = readdirSync(testDir).filter(file => file.endsWith(".t.sol")).sort()
  let total = 0
  let invariants = 0
  const byFile = []
  for (const file of files) {
    const text = readFileSync(join(testDir, file), "utf8")
    const tests = [...text.matchAll(/function\s+(test|invariant)[A-Za-z0-9_]*\s*\(/g)]
    const invariantCount = tests.filter(match => match[1] === "invariant").length
    total += tests.length
    invariants += invariantCount
    byFile.push({ file, tests: tests.length, invariants: invariantCount })
  }
  if (total === 0) fail("counted no tests; the test suite shape changed")
  return { total, invariants, byFile }
}

// --- revert strings ---------------------------------------------------------
// The exact string each require() throws, with the function it guards, so the
// integration guide can list real failure modes instead of paraphrasing them.

function readReverts() {
  const reverts = {}
  for (const { name, source } of EXPORTED_CONTRACTS) {
    const text = readText(join(contractsDir, source))
    const functions = [...text.matchAll(/function\s+(\w+)\s*\(/g)].map(match => ({
      name: match[1],
      index: match.index ?? 0
    }))
    const modifiers = [...text.matchAll(/modifier\s+(\w+)\s*\(?/g)].map(match => ({
      name: `${match[1]} modifier`,
      index: match.index ?? 0
    }))
    const scopes = [...functions, ...modifiers].sort((a, b) => a.index - b.index)
    const seen = new Set()
    const entries = []
    for (const match of text.matchAll(/require\([^;]*?,\s*"([^"]+)"\s*\)/gs)) {
      const message = match[1]
      const at = match.index ?? 0
      const scope = [...scopes].reverse().find(candidate => candidate.index < at)
      const key = `${scope?.name ?? ""}:${message}`
      if (seen.has(key)) continue
      seen.add(key)
      entries.push({ scope: scope?.name ?? null, message })
    }
    if (entries.length > 0) reverts[name] = entries
  }
  if (Object.keys(reverts).length === 0) fail("no revert strings found; the source shape changed")
  return reverts
}

// --- risk disclosure --------------------------------------------------------
// The documentation's risk page has to say the same thing the application says
// before a wallet is connected. Rather than keeping two copies in step by hand,
// the app's disclosure is read out of its own source and rendered here.

function readRiskDisclosure() {
  const path = join(appRepo, "app", "risk", "page.tsx")
  const source = readText(path)

  const array = source.match(/const risks = \[([\s\S]*?)\n\]/)
  if (!array) fail(`could not find the risks array in ${path}; the app's risk page changed shape`)
  const items = [...array[1].matchAll(/title:\s*"((?:[^"\\]|\\.)*)",\s*body:\s*"((?:[^"\\]|\\.)*)"/g)].map(
    match => ({ title: match[1], body: match[2] })
  )
  if (items.length === 0) fail(`the risks array in ${path} yielded no entries`)

  const collapse = text => text.replace(/\s+/g, " ").trim()
  const lead = source.match(/lead="([^"]+)"/)?.[1] ?? null
  const closing = source.match(/<p className="text-\[13px\][^"]*">([\s\S]*?)<\/p>/)?.[1]
  if (!closing) fail(`could not find the closing disclosure paragraph in ${path}`)

  return {
    source: "safix-app/app/risk/page.tsx",
    lead,
    items: items.map(item => ({ title: item.title, body: collapse(item.body) })),
    closing: collapse(closing)
  }
}

// --- networks ---------------------------------------------------------------

function readRpcEndpoints() {
  const toml = readText(join(contractsDir, "foundry.toml"))
  const section = toml.split(/^\[rpc_endpoints\]$/m)[1]
  if (!section) fail("foundry.toml has no [rpc_endpoints] section")
  const endpoints = {}
  for (const line of section.split("\n")) {
    if (/^\s*\[/.test(line)) break
    const match = line.match(/^\s*([\w-]+)\s*=\s*"([^"]+)"/)
    if (match) endpoints[match[1]] = match[2]
  }
  if (Object.keys(endpoints).length === 0) fail("foundry.toml [rpc_endpoints] is empty")
  return endpoints
}

function readChainDefinitions() {
  const source = readText(join(appRepo, "lib", "chain.ts"))
  const chains = new Map()
  for (const block of source.split("defineChain(").slice(1)) {
    const id = block.match(/\bid:\s*(\d+)/)?.[1]
    if (!id) continue
    const chainName = block.match(/\bname:\s*"([^"]+)"/)?.[1] ?? null
    const explorer = block.match(/blockExplorers:\s*\{[^}]*default:\s*\{([^}]*)\}/s)?.[1]
    const url = explorer?.match(/url:\s*"([^"]+)"/)?.[1]
    const explorerName = explorer?.match(/name:\s*"([^"]+)"/)?.[1] ?? null
    if (!url) continue
    chains.set(Number(id), {
      chainName,
      explorer: { name: explorerName, url: url.replace(/\/+$/, "") }
    })
  }
  if (chains.size === 0) fail("could not read any chain definition out of the app's lib/chain.ts")
  return chains
}

// The protocol declares one RPC endpoint per public network in foundry.toml.
// These are the two it ships; the label is the only thing this script names.
const NETWORK_LABELS = {
  robinhood: { key: "mainnet", label: "Mainnet", testnet: false },
  robinhood_testnet: { key: "testnet", label: "Testnet", testnet: true }
}

async function chainIdOf(rpcUrl) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] })
  })
  if (!response.ok) fail(`${rpcUrl} answered ${response.status} to eth_chainId`)
  const body = await response.json()
  if (!body.result) fail(`${rpcUrl} returned no chain id: ${JSON.stringify(body)}`)
  return Number.parseInt(body.result, 16)
}

async function buildNetworks() {
  const endpoints = readRpcEndpoints()
  const definitions = readChainDefinitions()
  const networks = []
  for (const [endpointKey, rpcUrl] of Object.entries(endpoints)) {
    const label = NETWORK_LABELS[endpointKey]
    if (!label) {
      console.warn(`sync-protocol: skipping unlabelled rpc endpoint "${endpointKey}"`)
      continue
    }
    const chainId = await chainIdOf(rpcUrl)
    const definition = definitions.get(chainId)
    if (!definition) fail(`the app defines no chain for chain id ${chainId}`)
    networks.push({
      key: label.key,
      label: label.label,
      name: definition.chainName ?? label.label,
      testnet: label.testnet,
      foundryProfile: endpointKey,
      chainId,
      rpcUrl,
      explorer: definition.explorer
    })
    console.log(`network ${label.key}: chain id ${chainId} confirmed live at ${rpcUrl}`)
  }
  if (networks.length === 0) fail("no networks resolved")
  return networks.sort((a, b) => Number(a.testnet) - Number(b.testnet))
}

// --- deployments ------------------------------------------------------------
// Preferred source is the protocol repo's deployments/<network>.json. When only
// a raw Foundry broadcast is available, that is read instead, the same way
// scripts/wire-env.mjs reads it.

function readDeploymentFile(network) {
  const path = join(protocolRepo, "deployments", `${network.key}.json`)
  if (!existsSync(path)) return null
  const record = JSON.parse(readFileSync(path, "utf8"))
  if (Number(record.chainId) !== network.chainId) {
    fail(`deployments/${network.key}.json is for chain ${record.chainId}, expected ${network.chainId}`)
  }
  // The record carries an entry per deployed contract, each an object with its
  // address, transaction and block. The pages want the protocol's own contracts
  // apart from the assets a test deployment brings with it, so they are split by
  // name: anything that is not one of the four is a token that deployment made.
  const core = new Set(["SafixPool", "PassportRegistry", "PartnershipDesk", "SafixTimelock"])
  const contracts = {}
  const tokens = {}
  for (const [name, entry] of Object.entries(record.contracts ?? {})) {
    const address = typeof entry === "string" ? entry : entry?.address
    if (!address) continue
    if (core.has(name)) contracts[name] = address
    else tokens[name] = address
  }
  return { ...record, contracts, tokens, source: `deployments/${network.key}.json` }
}

function readBroadcast(network) {
  const path = join(
    contractsDir,
    "broadcast",
    "Deploy.s.sol",
    String(network.chainId),
    "run-latest.json"
  )
  if (!existsSync(path)) return null
  const broadcast = JSON.parse(readFileSync(path, "utf8"))
  const contracts = {}
  const tokens = {}
  for (const tx of broadcast.transactions ?? []) {
    if (tx.transactionType !== "CREATE" || !tx.contractAddress) continue
    const address = getAddress(tx.contractAddress)
    if (tx.contractName === "MockERC20") tokens[tx.arguments?.[1] ?? address] = address
    else contracts[tx.contractName] = address
  }
  const blocks = (broadcast.receipts ?? []).map(receipt => Number.parseInt(receipt.blockNumber, 16))
  return {
    network: network.key,
    chainId: network.chainId,
    deployBlock: blocks.length > 0 ? Math.min(...blocks) : null,
    deployedAt: broadcastTime(broadcast.timestamp),
    commit: resolveCommit(broadcast.commit),
    contracts,
    tokens,
    source: `contracts/broadcast/Deploy.s.sol/${network.chainId}/run-latest.json`
  }
}

// Foundry has written the broadcast timestamp in milliseconds since v1; older
// runs wrote seconds. Read whichever this run produced rather than assuming.
function broadcastTime(timestamp) {
  if (!timestamp) return null
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000
  return new Date(ms).toISOString()
}

// The broadcast records the short commit it was built from. Expand it to the
// full hash from the checkout when they agree, and refuse to guess when they do
// not, because the addresses would then belong to code nobody can look up.
function resolveCommit(broadcastCommit) {
  const head = gitCommit(protocolRepo)
  if (!broadcastCommit) return head
  if (head && head.startsWith(broadcastCommit)) return head
  console.warn(
    `sync-protocol: broadcast was built from ${broadcastCommit}, the checkout is at ${head ?? "unknown"}`
  )
  return broadcastCommit
}

function gitCommit(repo) {
  try {
    return git(repo, "rev-parse", "HEAD")
  } catch {
    return null
  }
}

function syncDeployments(networks) {
  const deploymentsDir = join(outDir, "deployments")
  rmSync(deploymentsDir, { recursive: true, force: true })
  mkdirSync(deploymentsDir, { recursive: true })
  const found = []
  for (const network of networks) {
    const record = readDeploymentFile(network) ?? readBroadcast(network)
    if (!record) {
      console.log(`network ${network.key}: no deployment record found`)
      continue
    }
    writeJson(join(deploymentsDir, `${network.key}.json`), record)
    console.log(`network ${network.key}: deployment read from ${record.source}`)
    found.push(network.key)
  }
  return found
}

// --- entrypoint -------------------------------------------------------------

async function main() {
  if (!existsSync(contractsDir)) {
    fail(`no protocol checkout at ${protocolRepo}; clone safixlabs/safix or set SAFIX_REPO`)
  }
  if (!existsSync(join(appRepo, "lib", "chain.ts"))) {
    fail(`no app checkout at ${appRepo}; clone safixlabs/safix-app or set SAFIX_APP_REPO`)
  }

  const contracts = exportAbis()
  const limits = readLimits()
  const reverts = readReverts()
  const risk = readRiskDisclosure()
  const tests = readTestSuite()
  const keeper = readKeeper()
  const networks = await buildNetworks()
  const deployed = syncDeployments(networks)

  writeJson(join(outDir, "networks.json"), networks)
  writeJson(join(outDir, "limits.json"), limits)
  writeJson(join(outDir, "reverts.json"), reverts)
  writeJson(join(outDir, "risk-disclosure.json"), risk)
  writeJson(join(outDir, "keeper.json"), keeper)
  writeJson(join(outDir, "meta.json"), {
    syncedAt: new Date().toISOString(),
    protocolRepo: "safixlabs/safix",
    protocolCommit: gitCommit(protocolRepo),
    appRepo: "safixlabs/safix-app",
    appCommit: gitCommit(appRepo),
    contracts,
    tests,
    deployedNetworks: deployed
  })

  console.log(`wrote ${outDir}`)
}

main()
