import type { Metadata } from "next"
import Link from "next/link"
import Callout from "@/components/Callout"
import CodeBlock from "@/components/CodeBlock"
import { Mono, Table } from "@/components/Table"
import { DocHeader, H2, P, Usdg } from "@/components/doc"
import {
  eventsOf,
  functionReference,
  limits,
  networkStates,
  protocolMeta,
  revertsOf
} from "@/lib/protocol"

export const metadata: Metadata = {
  title: "Integration guide",
  description:
    "Read Safix pool state, open and close a position, and index the events, using the published ABIs and a public RPC endpoint."
}

const READS = [
  "totalDeposits",
  "availableLiquidity",
  "assetCount",
  "assetList",
  "assetConfig",
  "currentPrice",
  "collateralValueStable",
  "positions",
  "isLiquidatable",
  "compoundedDepositOf",
  "gainOf",
  "originationFeeBps",
  "redemptionFeeBps",
  "liquidationIncentiveBps",
  "maxPriceAge",
  "passportRegistry"
]

const WRITES = [
  "deposit",
  "withdraw",
  "claimGains",
  "lockCollateral",
  "draw",
  "repay",
  "closePosition",
  "withdrawCollateral",
  "liquidate"
]

const REGISTRY_READS = ["isEligible", "checkMaskOf", "records", "attesters", "FULL_MASK"]
const REGISTRY_WRITES = ["attest", "revoke"]

const DESK_READS = [
  "partnershipCount",
  "partnerships",
  "contributions",
  "claimed",
  "profitOf",
  "operatorShareOf",
  "funderPayoutOf",
  "auditor",
  "settlementApproved"
]
const DESK_WRITES = ["fund", "reportReturn", "claim", "claimOperator"]

const INDEXED_EVENTS = [
  "Deposited",
  "Withdrawn",
  "GainsClaimed",
  "CollateralLocked",
  "CollateralWithdrawn",
  "Drawn",
  "Repaid",
  "PositionClosed",
  "Liquidated",
  "AssetConfigured",
  "PriceSet",
  "FeesSet"
]

export default function IntegrationPage() {
  const meta = protocolMeta()
  const bounds = limits()
  const states = networkStates()
  const state = states.find(candidate => candidate.network.testnet) ?? states[0]
  const testnet = state.network
  // Once something is deployed, the samples carry the real addresses so they can
  // be pasted straight into a terminal. Until then they carry the placeholder
  // and say where the value comes from.
  const poolAddress = state.deployment?.contracts.SafixPool ?? "0x..."
  const sampleAsset = state.snapshot?.pool.assets[0]?.address ?? "0x..."
  const deployBlock = state.deployment?.deployBlock ?? 0
  const addressesKnown = state.deployment !== null
  const reads = functionReference("SafixPool", READS)
  const writes = functionReference("SafixPool", WRITES)
  const events = eventsOf("SafixPool")
  const indexed = INDEXED_EVENTS.map(name => {
    const event = events.find(candidate => candidate.name === name)
    if (!event) throw new Error(`SafixPool has no event ${name}; regenerate data/protocol`)
    return event
  })
  const registryReads = functionReference("PassportRegistry", REGISTRY_READS)
  const registryWrites = functionReference("PassportRegistry", REGISTRY_WRITES)
  const deskReads = functionReference("PartnershipDesk", DESK_READS)
  const deskWrites = functionReference("PartnershipDesk", DESK_WRITES)
  const registryEvents = eventsOf("PassportRegistry")
  const deskEvents = eventsOf("PartnershipDesk")
  const poolReverts = revertsOf("SafixPool").filter(
    revert => revert.scope !== null && !revert.scope.endsWith("modifier")
  )

  return (
    <article>
      <DocHeader
        tag="Build"
        title="Integration guide"
        lead="Everything needed to read the pool, open a position against it, and follow what happens afterwards, without asking anyone for a missing piece."
      />

      <H2>What you need</H2>
      <P>
        Three things: an RPC endpoint for the network you are on, the pool address, and the ABI. The
        endpoints and addresses are on the{" "}
        <Link href="/addresses/" className="text-mint transition-colors hover:text-fog">
          addresses page
        </Link>
        , generated from the protocol's own deployment records. The ABIs are served from this site,
        compiled from the same commit those addresses were built from:
      </P>
      <Table
        head={["Contract", "ABI", "Source", "Compiler"]}
        rows={meta.contracts.map(contract => [
          <Mono key="name">{contract.name}</Mono>,
          <a
            key="abi"
            href={`/abi/${contract.name}.json`}
            className="text-mint transition-colors hover:text-fog"
          >
            /abi/{contract.name}.json
          </a>,
          <Mono key="source">{contract.source}</Mono>,
          <Mono key="compiler">{contract.compiler ?? "—"}</Mono>
        ])}
      />

      <H2>Reading pool state</H2>
      <P>
        Every read is a plain view call. Nothing about Safix requires a wallet, an API key, or an
        indexer to answer the questions that matter: how much liquidity the pool has, what an asset is
        worth, and whether a position is healthy.
      </P>
      <CodeBlock
        language="typescript"
        code={`import { createPublicClient, http } from "viem"
import poolAbi from "./SafixPool.json" with { type: "json" }

const client = createPublicClient({ transport: http("${testnet.rpcUrl}") })
const pool = "${poolAddress}"${addressesKnown ? "" : " // from the addresses page"}

const read = (functionName: string, args?: unknown[]) =>
  client.readContract({ address: pool, abi: poolAbi, functionName, args })

const [totalDeposits, availableLiquidity, assetCount] = await Promise.all([
  read("totalDeposits"),
  read("availableLiquidity"),
  read("assetCount")
])

// Walk the configured collateral assets and price each one.
for (let i = 0n; i < assetCount; i++) {
  const asset = await read("assetList", [i])
  const [enabled, maxLtvBps, liqThresholdBps] = await read("assetConfig", [asset])
  const [price1e18, updatedAt] = await read("currentPrice", [asset])
  console.log(asset, { enabled, maxLtvBps, liqThresholdBps, price1e18, updatedAt })
}`}
        caption={`Reading the pool with viem${
          addressesKnown ? ", against the live " + testnet.label.toLowerCase() + " deployment" : ""
        }. The same calls work from ethers, web3.py, or anything else that speaks JSON-RPC.`}
      />
      <CodeBlock
        language="shell"
        code={`export RPC=${testnet.rpcUrl}
export POOL=${poolAddress}
export ASSET=${sampleAsset}

cast call --rpc-url $RPC $POOL "totalDeposits()(uint256)"
cast call --rpc-url $RPC $POOL "availableLiquidity()(uint256)"
cast call --rpc-url $RPC $POOL "assetCount()(uint256)"
cast call --rpc-url $RPC $POOL "currentPrice(address)(uint256,uint256)" $ASSET
cast call --rpc-url $RPC $POOL "positions(address,address)(uint256,uint256,uint256)" $BORROWER $ASSET`}
        caption="The same reads from a shell with Foundry's cast."
      />

      <H2>Units, and the one that catches people</H2>
      <P>
        Basis points are used for every rate: {bounds.bps} bps is 100%. Prices are USD with 18
        decimals. Collateral amounts are in the collateral token's own decimals, and debt is in the
        pool's stable token decimals.
      </P>
      <P>
        The conversion between them is fixed in the contract.{" "}
        <Mono>collateralValueStable</Mono> computes{" "}
        <Mono>amount &times; price1e18 / 1e30</Mono>, which lands in stable units only when the
        collateral has 18 decimals and the stable has 6. That is the shape the pool is configured
        for. If you are pricing a position yourself rather than asking the contract, ask the contract
        instead: it is a view function and it is the number the protocol will actually use.
      </P>
      <CodeBlock
        language="typescript"
        code={`// Do not recompute this. Ask the pool.
const value = await read("collateralValueStable", [asset, collateralAmount])

// Maximum you can draw right now, accounting for the origination fee that is
// added to the debt on the same call:
//   debt + amount + amount * originationFeeBps / BPS <= value * maxLtvBps / BPS
const BPS = ${bounds.bps}n
const headroom = (value * BigInt(maxLtvBps)) / BPS - debt
const maxDraw = headroom > 0n ? (headroom * BPS) / (BPS + BigInt(originationFeeBps)) : 0n`}
        caption="The origination fee is part of the debt the LTV check sees, so the naive headroom figure is always slightly too high."
      />

      <H2>Opening a position</H2>
      <P>
        Three transactions, and the first is a standard ERC-20 approval. There is no subscription, no
        whitelist call, and no off-chain step in between.
      </P>
      <CodeBlock
        language="typescript"
        code={`import { createWalletClient, http, parseUnits } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import erc20Abi from "./IERC20.json" with { type: "json" }

const wallet = createWalletClient({
  account: privateKeyToAccount(process.env.PRIVATE_KEY as \`0x\${string}\`),
  chain: { id: ${testnet.chainId}, name: "${testnet.name}", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: ["${testnet.rpcUrl}"] } } },
  transport: http("${testnet.rpcUrl}")
})

const collateral = parseUnits("10", 18)

// 1. Let the pool move the collateral.
await wallet.writeContract({ address: asset, abi: erc20Abi, functionName: "approve", args: [pool, collateral] })

// 2. Lock it. With nothing drawn against it, it can be withdrawn again at any time.
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "lockCollateral", args: [asset, collateral] })

// 3. Draw. The origination fee is added to the debt, not deducted from the transfer.
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "draw", args: [asset, maxDraw] })`}
        caption="Locking collateral and drawing against it."
      />
      <P>
        Closing works the same way in reverse. <Mono>repay</Mono> takes debt down by any amount;{" "}
        <Mono>closePosition</Mono> settles the remaining debt plus the redemption fee and returns all
        the collateral in one call. The redemption fee is charged on everything ever drawn on that
        position, which is <Mono>totalDrawn</Mono>, not on the balance outstanding at the end.
      </P>
      <CodeBlock
        language="typescript"
        code={`// Paying part of the debt back. Nothing is charged for doing this, and there
// is no minimum: repay takes any amount up to the outstanding debt.
await wallet.writeContract({ address: stable, abi: erc20Abi, functionName: "approve", args: [pool, amount] })
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "repay", args: [asset, amount] })

// Freeing collateral without closing. The pool re-checks the maximum LTV on
// what would be left, and refuses with "would break ltv" if it no longer fits.
await wallet.writeContract({
  address: pool, abi: poolAbi, functionName: "withdrawCollateral", args: [asset, amount]
})`}
        caption={`Repaying and releasing collateral. While a position has drawn history, withdrawCollateral will not take the balance to zero: close it instead.`}
      />
      <CodeBlock
        language="typescript"
        code={`const [collateralAmount, debt, totalDrawn] = await read("positions", [borrower, asset])
const redemptionFee = (totalDrawn * BigInt(redemptionFeeBps)) / BPS
const owed = debt + redemptionFee

// The pool pulls what is owed, so approve the stable token first.
await wallet.writeContract({ address: stable, abi: erc20Abi, functionName: "approve", args: [pool, owed] })
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "closePosition", args: [asset] })`}
        caption="Closing a position. Approve the stable token for debt plus the redemption fee, not just the debt."
      />

      <H2>Watching a position</H2>
      <P>
        A position is liquidatable when its collateral value, discounted by the liquidation threshold,
        no longer covers the debt. The contract will tell you directly, and the price at which that
        flips is worth computing so a borrower sees it coming.
      </P>
      <CodeBlock
        language="typescript"
        code={`const atRisk = await read("isLiquidatable", [borrower, asset])

// The collateral price at which the position becomes liquidatable.
//   value * liqThresholdBps / BPS < debt, where value = collateral * price / 1e30
const liquidationPrice1e18 =
  collateralAmount === 0n || debt === 0n
    ? 0n
    : (debt * BPS * 10n ** 30n) / (collateralAmount * BigInt(liqThresholdBps))`}
        caption="The same formula the Safix app uses to show a liquidation price."
      />

      <H2>Providing liquidity</H2>
      <P>
        The other side of the pool. A provider deposits the stable asset, and their return arrives as
        seized collateral rather than as a rate, so a deposit has two numbers: the stake, which
        shrinks as liquidations consume it, and the gains, which accumulate per collateral asset.
      </P>
      <CodeBlock
        language="typescript"
        code={`// Depositing. There is no lock-up and no minimum.
await wallet.writeContract({ address: stable, abi: erc20Abi, functionName: "approve", args: [pool, amount] })
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "deposit", args: [amount] })

// Reading a provider's position. compoundedDepositOf is the stake after every
// liquidation it has absorbed, which is what withdraw is measured against.
const stake = await read("compoundedDepositOf", [provider])
const gains = await Promise.all(assets.map(asset => read("gainOf", [provider, asset])))

// Taking the collateral that liquidations paid out.
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "claimGains", args: [assets] })

// Withdrawing. Served from idle liquidity only, so compare against
// availableLiquidity first or the call reverts with "illiquid".
await wallet.writeContract({ address: pool, abi: poolAbi, functionName: "withdraw", args: [amount] })`}
        caption="The provider lifecycle. claimGains takes the asset list you want to sweep, so a provider can claim one collateral type without touching the others."
      />
      <P>
        Two things surprise people here. A deposit is not a balance you can read off an ERC-20:{" "}
        <Mono>compoundedDepositOf</Mono> is the live figure and it falls when liquidations are
        absorbed. And a withdrawal is bounded by <Mono>availableLiquidity</Mono>, not by the stake, so
        a pool that is mostly lent out can refuse a withdrawal that the stake would otherwise cover.
      </P>

      <H2>The passport gate</H2>
      <P>
        When the pool has a passport registry configured, <Mono>draw</Mono> requires the caller to
        hold a complete, unexpired attestation. Deposits, repayments, and liquidations are never
        gated. Check before you build a draw flow, because the answer is a single call and the revert
        is otherwise the first thing your users will meet.
      </P>
      <CodeBlock
        language="typescript"
        code={`import registryAbi from "./PassportRegistry.json" with { type: "json" }

const registry = await read("passportRegistry")
if (registry !== "0x0000000000000000000000000000000000000000") {
  const eligible = await client.readContract({
    address: registry,
    abi: registryAbi,
    functionName: "isEligible",
    args: [borrower]
  })
  // false means draw() reverts with "passport required"
}`}
        caption="A pool with no registry configured draws without a passport. Check rather than assume."
      />

      <H2>Reads that matter</H2>
      <Table
        head={["Function", "Selector", "Returns"]}
        rows={reads.map(fn => [
          <Mono key="sig">{fn.signature}</Mono>,
          <Mono key="selector">{fn.selector}</Mono>,
          <Mono key="outputs">{fn.outputs.join(", ") || "—"}</Mono>
        ])}
      />

      <H2>Writes that matter</H2>
      <Table
        head={["Function", "Selector", "Takes"]}
        rows={writes.map(fn => [
          <Mono key="sig">{fn.signature}</Mono>,
          <Mono key="selector">{fn.selector}</Mono>,
          <Mono key="inputs">{fn.inputs.join(", ") || "—"}</Mono>
        ])}
      />

      <H2>The passport registry</H2>
      <P>
        One question matters to an integrating platform: <Mono>isEligible</Mono>. The rest of the
        surface belongs to whoever attests. A platform that wants more than a yes or no can read the
        mask and its expiry directly, and learns which checks passed without learning anything behind
        them.
      </P>
      <Table
        head={["Function", "Selector", "Returns", "Access"]}
        rows={[...registryReads, ...registryWrites].map(fn => [
          <Mono key="sig">{fn.signature}</Mono>,
          <Mono key="selector">{fn.selector}</Mono>,
          <Mono key="outputs">{fn.outputs.join(", ") || "—"}</Mono>,
          fn.stateMutability === "view" ? "anyone" : "attester or owner"
        ])}
      />

      <H2>The partnership desk</H2>
      <P>
        The profit and loss sharing track is a separate contract with its own lifecycle: an owner
        creates a partnership, anyone funds it pro rata up to the goal, the operator receives the
        capital on activation and reports returns back, and settlement splits whatever came back.
        Funding and claiming are open; creating, activating and settling are not.
      </P>
      <Table
        head={["Function", "Selector", "Returns", "Access"]}
        rows={[...deskReads, ...deskWrites].map(fn => [
          <Mono key="sig">{fn.signature}</Mono>,
          <Mono key="selector">{fn.selector}</Mono>,
          <Mono key="outputs">{fn.outputs.join(", ") || "—"}</Mono>,
          fn.stateMutability === "view" ? "anyone" : DESK_ACCESS[fn.name] ?? "anyone"
        ])}
      />
      <CodeBlock
        language="typescript"
        code={`import deskAbi from "./PartnershipDesk.json" with { type: "json" }

// Funding a partnership, up to what is left of its goal.
const [operator, operatorShareBps, fundingDeadline, status, fundingGoal, funded] =
  await client.readContract({ address: desk, abi: deskAbi, functionName: "partnerships", args: [id] })
const remaining = fundingGoal - funded

await wallet.writeContract({ address: stable, abi: erc20Abi, functionName: "approve", args: [desk, amount] })
await wallet.writeContract({ address: desk, abi: deskAbi, functionName: "fund", args: [id, amount] })

// After settlement, what this funder is owed. Zero until the partnership is
// settled or cancelled; a cancelled partnership returns the contribution.
const payout = await client.readContract({
  address: desk, abi: deskAbi, functionName: "funderPayoutOf", args: [id, funder]
})
await wallet.writeContract({ address: desk, abi: deskAbi, functionName: "claim", args: [id] })`}
        caption="Funding a partnership and claiming after settlement. Losses fall on the capital, so a payout can be less than the contribution."
      />

      <H2>Events to index</H2>
      <P>
        Position history, provider returns, and every parameter change are all reconstructible from
        events. There is no separate state you need us to expose. Borrower and asset are indexed on the
        position events, so a single filter follows one borrower across every asset, or one asset
        across every borrower.
      </P>
      <Table
        head={["Event", "topic0", "Indexed", "Data"]}
        rows={indexed.map(event => [
          <Mono key="name">{event.signature}</Mono>,
          <Mono key="topic">{event.topic0}</Mono>,
          <Mono key="indexed">{event.indexed.join(", ") || "—"}</Mono>,
          <Mono key="data">{event.data.join(", ") || "—"}</Mono>
        ])}
      />
      <CodeBlock
        language="typescript"
        code={`// Every position that has ever drawn, without a database.
const logs = await client.getLogs({
  address: pool,
  event: poolAbi.find(item => item.type === "event" && item.name === "Drawn"),
  fromBlock: ${deployBlock}n,${addressesKnown ? "" : " // the pool's deploy block, from the addresses page"}
  toBlock: "latest"
})

const positions = new Map()
for (const log of logs) {
  positions.set(\`\${log.args.borrower}:\${log.args.asset}\`, log.args)
}`}
        caption="This is exactly how the Safix keeper discovers positions: from Drawn, with no registry and no database."
      />

      <P>
        The other two contracts carry their own histories. Passport attestations and revocations are
        the audit trail behind every gated draw, and the desk's events are the whole partnership
        lifecycle from creation to the last claim.
      </P>
      <Table
        head={["Contract", "Event", "topic0", "Indexed"]}
        rows={[
          ...registryEvents.map(event => [
            <Mono key="c">PassportRegistry</Mono>,
            <Mono key="name">{event.signature}</Mono>,
            <Mono key="topic">{event.topic0}</Mono>,
            <Mono key="indexed">{event.indexed.join(", ") || "—"}</Mono>
          ]),
          ...deskEvents.map(event => [
            <Mono key="c">PartnershipDesk</Mono>,
            <Mono key="name">{event.signature}</Mono>,
            <Mono key="topic">{event.topic0}</Mono>,
            <Mono key="indexed">{event.indexed.join(", ") || "—"}</Mono>
          ])
        ]}
      />

      <Callout title="Public endpoints are rate limited">
        <p>
          The endpoints published here are the chain's public ones and they are rate limited. They are
          fine for a spot check or a local script. Anything that polls, indexes, or serves users
          should run through a dedicated provider.
        </p>
      </Callout>

      <H2>Reverts you will meet</H2>
      <P>
        The contract uses plain require strings. These are the ones a caller can hit, taken from the
        source of the deployed contracts, so you can map them to messages your own users will
        understand.
      </P>
      <Table
        head={["Function", "Revert", "What it means"]}
        rows={poolReverts.map(revert => [
          <Mono key="scope">{revert.scope}</Mono>,
          <Mono key="message">{revert.message}</Mono>,
          <span key="meaning">{REVERT_MEANINGS[revert.message] ?? "—"}</span>
        ])}
      />

      <H2>What the pool cannot do</H2>
      <P>
        No function anywhere in the pool moves a user's collateral or deposit to a third party except
        through liquidation, and liquidation only fires when <Mono>isLiquidatable</Mono> is true. The
        owner can change fees within the bounds the contract enforces, configure assets, set price
        feeds, and collect accrued protocol fees. It cannot pause the pool, seize a position, or mint{" "}
        <Usdg />. The bounds are on the{" "}
        <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
          parameter reference
        </Link>
        .
      </P>
    </article>
  )
}

const DESK_ACCESS: Record<string, string> = {
  fund: "anyone, while funding",
  reportReturn: "the operator",
  claim: "the funder",
  claimOperator: "the operator"
}

const REVERT_MEANINGS: Record<string, string> = {
  "asset off": "The asset is not configured as collateral on this pool.",
  zero: "An amount of zero was passed where a positive amount is required.",
  "passport required": "The pool has a passport registry and the caller holds no complete attestation.",
  "exceeds ltv": "The draw, including its origination fee, would push debt past the asset's maximum LTV.",
  illiquid: "The pool does not hold enough free stable liquidity right now.",
  "transfer failed": "The underlying ERC-20 transfer returned false.",
  "bad amount": "The amount is zero or larger than the balance being spent down.",
  "close position instead":
    "Withdrawing all collateral while the position has debt or drawn history is not allowed; close it.",
  "would break ltv": "Withdrawing that much collateral would leave the remaining debt above the maximum LTV.",
  "no position": "There is nothing to close: no collateral and no debt.",
  healthy: "The position is above its liquidation threshold and cannot be liquidated.",
  "pool too small": "The stability pool has less in deposits than the debt being offset.",
  "stale price": "The price for this asset is older than the pool's maximum price age.",
  "bad feed answer": "The Chainlink feed returned a non-positive price.",
  "bad feed round": "The Chainlink feed returned a round that has never been updated.",
  "not price updater": "Only the owner or the configured price updater can push a manual price.",
  "bad config": "Maximum LTV must be below the liquidation threshold, which must be at most 100%.",
  "fee too high": "Fees are bounded by the contract; see the parameter reference.",
  "too high": "The liquidation incentive is bounded by the contract; see the parameter reference.",
  "bad feed decimals": "The price feed reports more decimals than the pool can scale from.",
  "zero owner": "Ownership cannot be transferred to the zero address."
}
