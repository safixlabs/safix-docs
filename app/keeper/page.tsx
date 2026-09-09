import type { Metadata } from "next"
import Link from "next/link"
import Callout from "@/components/Callout"
import CodeBlock from "@/components/CodeBlock"
import { Mono, Table } from "@/components/Table"
import { DocHeader, H2, P, RowList } from "@/components/doc"
import { formatBps, keeperReference, limits, networkStates } from "@/lib/protocol"

export const metadata: Metadata = {
  title: "Running a keeper",
  description:
    "Run a Safix liquidation keeper: what it does, what it needs, how it finds positions, and how the liquidation incentive pays for it."
}

const FIELD_NOTES: Record<string, string> = {
  rpcUrl: "The endpoint the keeper reads and writes through. Use a dedicated provider, not the public one.",
  poolAddress: "The SafixPool address on that network, from the addresses page.",
  deployBlock: "Where the event scan starts. Set it to the pool's deploy block so the first scan is not a full-chain crawl.",
  intervalMs: "How long watch mode sleeps between passes.",
  prices: "Asset address to USD price, for assets with no Chainlink feed. Leave it empty if every asset has a feed."
}

export default function KeeperPage() {
  const keeper = keeperReference()
  const bounds = limits()
  const states = networkStates()
  const snapshot = states.find(state => state.snapshot !== null)?.snapshot ?? null
  const incentiveBps = snapshot?.pool.liquidationIncentiveBps ?? bounds.defaults.liquidationIncentiveBps
  const incentive = formatBps(incentiveBps)
  // Worked from the incentive that is actually configured, so the example can
  // never contradict the rate printed beside it.
  const exampleSeized = 10_000
  const examplePays = (exampleSeized * incentiveBps) / bounds.bps
  const testnet = states.find(state => state.network.testnet)?.network ?? states[0].network

  return (
    <article>
      <DocHeader
        tag="Build"
        title="Running a keeper"
        lead="The protocol needs somebody to call liquidate, and it pays for it. Here is what a keeper does, what it costs to run, and how to run one."
      />

      <H2>Why anyone would</H2>
      <P>
        A liquidation is a permissionless call. When a position falls below its liquidation threshold,
        the first account to call <Mono>liquidate</Mono> is paid {incentive} of the collateral the call
        seizes, transferred to the caller in the same transaction. Nothing about that is reserved for
        us. The protocol's safety depends on at least one keeper existing, and the incentive is what
        buys that.
      </P>
      <P>
        Whether it pays depends on position size against gas. At {incentive}, seizing collateral worth{" "}
        {exampleSeized.toLocaleString("en-US")} pays {examplePays.toLocaleString("en-US")}, while
        seizing collateral worth a hundred pays{" "}
        {((100 * incentiveBps) / bounds.bps).toFixed(2)} and will not cover the transaction. A keeper
        is therefore worth running when the pool has real positions in it, and worth doing the
        arithmetic on when it does not.
      </P>

      <H2>What it does on each pass</H2>
      <RowList
        items={[
          "Pushes a price for every asset listed in the config that has no Chainlink feed, skipping any whose on-chain price already matches.",
          "Reads every Drawn event from the deploy block to the head, which yields every borrower and asset pair that has ever drawn.",
          "Asks the pool isLiquidatable for each pair and skips the healthy ones.",
          "Calls liquidate on the rest for the whole debt, and waits for the receipt before moving on."
        ]}
      />
      <P>
        There is no database, no indexer and no registry. Position discovery is the event log, which
        means a keeper can be stopped, moved, or replaced at any time and the next one rebuilds the
        same picture from the chain.
      </P>

      <H2>What you need</H2>
      <Table
        head={["Requirement", "For what"]}
        rows={[
          ["Node with " + Object.entries(keeper.dependencies).map(([name, range]) => `${name} ${range}`).join(", "), "The worker itself"],
          ["A funded key on the target chain", "Gas for the liquidation transactions"],
          ["An RPC endpoint", "Reads and writes; the public one is rate limited"],
          [
            "Owner or price updater rights",
            "Only if you push manual prices. Liquidations need no permission at all."
          ]
        ]}
      />
      <Callout title="Liquidating needs no privilege">
        <p>
          The only part of the keeper that requires a role is the price push, and that role is the
          pool's separate price updater address, which can do nothing else. Liquidation works from any
          funded account. If you only want the incentive, you need nothing from us.
        </p>
      </Callout>

      <H2>Running it</H2>
      <CodeBlock
        language="shell"
        code={`git clone https://github.com/safixlabs/safix
cd safix/keeper
npm install
cp config.example.json config.json
# edit config.json: rpcUrl, poolAddress and deployBlock from the addresses page

PRIVATE_KEY=0x... npm run ${Object.keys(keeper.scripts)[0] ?? "scan"}   # one pass, then exit
PRIVATE_KEY=0x... npm run ${Object.keys(keeper.scripts)[1] ?? "watch"}  # loop forever`}
        caption={`A single pass is ${Object.values(keeper.scripts)[0] ?? "scan"}; the loop is ${Object.values(keeper.scripts)[1] ?? "watch"}, sleeping ${keeper.defaultIntervalMs / 1000}s between passes by default.`}
      />
      <P>
        If you have just deployed the protocol yourself, the config can be generated instead of typed:{" "}
        <Mono>node scripts/wire-env.mjs testnet</Mono> writes{" "}
        <Mono>keeper/config.json</Mono> straight from the deployment broadcast, including the deploy
        block.
      </P>

      <H2>Configuration</H2>
      <Table
        head={["Field", "What it is"]}
        rows={keeper.configFields.map(field => [
          <Mono key="field">{field}</Mono>,
          FIELD_NOTES[field] ?? "See the keeper README."
        ])}
      />
      <CodeBlock
        language="json"
        code={JSON.stringify(
          {
            ...keeper.configExample,
            rpcUrl: testnet.rpcUrl,
            poolAddress: "0x...",
            deployBlock: 0
          },
          null,
          2
        )}
        caption="The config shape, taken from the keeper's own example file. Addresses come from the addresses page."
      />

      <H2>Writing your own</H2>
      <P>
        The whole thing is five functions and one event. This is the interface the Safix keeper uses,
        and it is the entire surface you need to reproduce it in any language.
      </P>
      <CodeBlock
        language="typescript"
        code={`const poolAbi = parseAbi([
${keeper.abi.map(entry => `  "${entry}"`).join(",\n")}
])`}
        caption="The keeper's complete ABI, read from its source."
      />
      <CodeBlock
        language="typescript"
        code={`// 1. Every borrower and asset that has ever drawn.
const logs = await client.getLogs({
  address: pool,
  event: poolAbi.find(item => item.type === "event" && item.name === "Drawn"),
  fromBlock: BigInt(deployBlock),
  toBlock: "latest"
})
const pairs = new Map()
for (const log of logs) pairs.set(\`\${log.args.borrower}:\${log.args.asset}\`, log.args)

// 2. Liquidate the unhealthy ones. maxUint256 offsets the whole debt; the
//    contract clamps it to what the position actually owes.
for (const { borrower, asset } of pairs.values()) {
  const unhealthy = await client.readContract({
    address: pool, abi: poolAbi, functionName: "isLiquidatable", args: [borrower, asset]
  })
  if (!unhealthy) continue
  await wallet.writeContract({
    address: pool, abi: poolAbi, functionName: "liquidate", args: [borrower, asset, maxUint256]
  })
}`}
        caption="The entire liquidation loop. Nothing is hidden behind an API."
      />
      <P>
        Before sending, it is worth checking the trade is worth making. The incentive is a share of the
        collateral seized, so estimate the gas and compare it to what the call will pay:
      </P>
      <CodeBlock
        language="shell"
        code={`cast estimate --rpc-url $RPC $POOL \\
  "liquidate(address,address,uint256)" $BORROWER $ASSET \\
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

# what the call would pay: seized collateral x ${incentive}
cast call --rpc-url $RPC $POOL "positions(address,address)(uint256,uint256,uint256)" $BORROWER $ASSET`}
        caption="Estimate before you send. A liquidation that costs more in gas than the incentive pays is not one to make."
      />

      <H2>Operating it</H2>
      <RowList
        items={[
          "Run it against a dedicated RPC provider. The public endpoints are rate limited and a watch loop will hit that limit.",
          "Set deployBlock. Without it the event scan starts at block zero and gets slower every day.",
          "Expect competition. Another keeper taking a liquidation first is the system working, not a failure; your transaction reverts with \"healthy\" and costs gas.",
          "A failed pass is logged and the loop continues. It does not exit on an RPC error, so restart policy matters less than alerting does.",
          "Price pushes are skipped when the on-chain price already matches, so a keeper with prices configured does not spend gas on unchanged values."
        ]}
      />

      <Callout title="What the keeper cannot do" tone="warning">
        <p>
          Nothing in the keeper can move a user's funds. It calls <Mono>liquidate</Mono>, which only
          succeeds on a position the contract already considers unhealthy, and{" "}
          <Mono>setPrice</Mono>, which requires the price updater role and is ignored for any asset
          with a Chainlink feed. A compromised keeper key costs its own gas balance and nothing else.
        </p>
      </Callout>

      <H2>Where the numbers come from</H2>
      <P>
        The incentive above is read from the deployed pool where there is one, and from the contract's
        compiled default otherwise. Pool addresses and deploy blocks are on the{" "}
        <Link href="/addresses/" className="text-mint transition-colors hover:text-fog">
          addresses page
        </Link>
        ; the thresholds that decide which positions become liquidatable are on the{" "}
        <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
          parameter reference
        </Link>
        .
      </P>
    </article>
  )
}
