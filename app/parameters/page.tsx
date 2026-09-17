import type { Metadata } from "next"
import Link from "next/link"
import Address from "@/components/Address"
import Callout from "@/components/Callout"
import { Mono, Table } from "@/components/Table"
import { DocHeader, H2, P, Usdg } from "@/components/doc"
import {
  explorerAddressUrl,
  formatBps,
  formatDuration,
  formatUsd1e18,
  limits,
  networkStates,
  protocolMeta,
  shortCommit,
  type NetworkState
} from "@/lib/protocol"

export const metadata: Metadata = {
  title: "Parameter reference",
  description:
    "The fees, loan-to-value ratios, liquidation thresholds and price feeds Safix runs with, read from the deployed contracts, with the bounds the code enforces."
}

/** At maximum draw, this is the price fall a position survives before it can be liquidated. */
const toleratedDrop = (maxLtvBps: number, liqThresholdBps: number) =>
  liqThresholdBps === 0 ? 0 : 1 - maxLtvBps / liqThresholdBps

function DeployedParameters({ state }: { state: NetworkState }) {
  const { network, snapshot } = state
  if (!snapshot) return null
  const pool = snapshot.pool

  return (
    <>
      <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
        Pool wide
      </h3>
      <Table
        head={["Parameter", "Value", "Set by"]}
        rows={[
          ["Origination fee", formatBps(pool.originationFeeBps), <Mono key="a">setFees</Mono>],
          ["Redemption fee", formatBps(pool.redemptionFeeBps), <Mono key="b">setFees</Mono>],
          [
            "Liquidation incentive",
            formatBps(pool.liquidationIncentiveBps),
            <Mono key="c">setLiquidationIncentive</Mono>
          ],
          [
            "Passport gate on draws",
            pool.passportGate ? "on" : "off",
            <Mono key="e">setPassportRegistry</Mono>
          ],
          [
            "Stable asset",
            `${pool.stable.symbol ?? "unknown"} · ${pool.stable.decimals ?? "?"} decimals`,
            "constructor, immutable"
          ],
          [
            "Price updater",
            pool.priceUpdater ? (
              <Address
                key="f"
                value={pool.priceUpdater}
                explorerUrl={explorerAddressUrl(network, pool.priceUpdater)}
              />
            ) : (
              "none"
            ),
            <Mono key="g">setPriceUpdater</Mono>
          ],
          [
            "Owner",
            <Address key="h" value={pool.owner} explorerUrl={explorerAddressUrl(network, pool.owner)} />,
            <Mono key="i">setOwner</Mono>
          ]
        ]}
      />

      <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
        Per asset
      </h3>
      <Table
        head={["Asset", "Max LTV", "Liquidation threshold", "Survives a fall of", "Price"]}
        rows={pool.assets.map(asset => [
          <span key="asset">
            <Mono>{asset.symbol ?? asset.address}</Mono>
            <span className="mt-1 block text-[12px] text-haze">{asset.name ?? ""}</span>
          </span>,
          formatBps(asset.maxLtvBps),
          formatBps(asset.liqThresholdBps),
          `${(toleratedDrop(asset.maxLtvBps, asset.liqThresholdBps) * 100).toFixed(1)}%`,
          <span key="price">
            {formatUsd1e18(asset.currentPriceUsd1e18) ?? "unreadable"}
            <span className="mt-1 block text-[12px] text-haze">
              {asset.priceSource === "chainlink" ? "Chainlink feed" : "manual price"}
            </span>
          </span>
        ])}
      />

      <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
        Price feeds
      </h3>
      <Table
        head={["Asset", "Source", "Feed", "Feed decimals", "Last update"]}
        rows={pool.assets.map(asset => [
          <Mono key="asset">{asset.symbol ?? asset.address}</Mono>,
          asset.priceSource === "chainlink" ? (asset.feedDescription ?? "Chainlink") : "manual push",
          asset.priceFeed ? (
            <Address
              key="feed"
              value={asset.priceFeed}
              explorerUrl={explorerAddressUrl(network, asset.priceFeed)}
            />
          ) : (
            "—"
          ),
          asset.priceFeedDecimals === null ? "—" : String(asset.priceFeedDecimals),
          asset.priceUpdatedAt
            ? `${new Date(asset.priceUpdatedAt * 1000).toISOString().replace("T", " ").slice(0, 19)} UTC`
            : "—"
        ])}
      />

      <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
        Price guards
      </h3>
      <P>
        What each asset&apos;s price is held to before the pool will act on it. These are per asset
        rather than protocol-wide, because a treasury wrapper and an equity neither go stale nor move
        at the same rate. A price outside any of them is refused, and the pool says which.
      </P>
      <Table
        head={["Asset", "Maximum age", "Deviation limit", "Floor", "Ceiling"]}
        rows={pool.assets.map(asset => [
          <Mono key="asset">{asset.symbol ?? asset.address}</Mono>,
          asset.maxPriceAgeSeconds ? formatDuration(asset.maxPriceAgeSeconds) : "no limit",
          asset.maxDeviationBps ? formatBps(asset.maxDeviationBps) : "no limit",
          asset.minPriceUsd1e18 && asset.minPriceUsd1e18 !== "0"
            ? (formatUsd1e18(asset.minPriceUsd1e18) ?? "—")
            : "no floor",
          asset.maxPriceUsd1e18 && asset.maxPriceUsd1e18 !== "0"
            ? (formatUsd1e18(asset.maxPriceUsd1e18) ?? "—")
            : "no ceiling"
        ])}
      />

      <P>
        Read from the deployed contracts at block {snapshot.blockNumber} on {snapshot.readAt.slice(0, 10)}.
      </P>
    </>
  )
}

export default function ParametersPage() {
  const bounds = limits()
  const meta = protocolMeta()
  const states = networkStates()
  const live = states.filter(state => state.snapshot !== null)

  return (
    <article>
      <DocHeader
        tag="Build"
        title="Parameter reference"
        lead="What Safix charges, how far each asset can be borrowed against, and where its price comes from, read out of the deployed contracts rather than described from memory."
      />

      <H2>What each parameter does</H2>
      <Table
        head={["Parameter", "Meaning", "Who it costs"]}
        rows={[
          [
            <Mono key="a">originationFeeBps</Mono>,
            "Added to the debt when funds are drawn. It is not deducted from the transfer, so drawing 1,000 leaves 1,000 in the wallet and a debt slightly above it.",
            "Borrower, once per draw"
          ],
          [
            <Mono key="b">redemptionFeeBps</Mono>,
            "Charged on closing, calculated on everything ever drawn on that position rather than the balance outstanding at the end.",
            "Borrower, once per position"
          ],
          [
            <Mono key="c">maxLtvBps</Mono>,
            "The most that can be owed against an asset's value at the moment of drawing or withdrawing collateral.",
            "Borrower, as a limit"
          ],
          [
            <Mono key="d">liqThresholdBps</Mono>,
            "The point at which the position can be liquidated. Always above the maximum LTV, and the gap between the two is the borrower's room to be wrong.",
            "Borrower, as a risk"
          ],
          [
            <Mono key="e">liquidationIncentiveBps</Mono>,
            "The share of seized collateral paid to whoever calls liquidate. It is carved out of the collateral, not added to the debt.",
            "Liquidity providers, out of the gain"
          ],
          [
            <Mono key="f">priceGuards</Mono>,
            "Per asset: how stale a price may be, how far it may move in one step, and the band it must fall inside. A price outside any of them is refused, and priceStatus says which. Zero disables that one check.",
            "Everyone, as a safety stop"
          ]
        ]}
      />

      <H2>Bounds the contract enforces</H2>
      <P>
        These are not policy. They are compiled into the deployed bytecode, so no owner action can go
        past them, and this table is generated from the contract source at commit{" "}
        <Mono>{shortCommit(meta.protocolCommit) ?? "unknown"}</Mono>.
      </P>
      <Table
        head={["Bound", "Limit", "Deployed default"]}
        rows={[
          [
            "Origination fee",
            `at most ${formatBps(bounds.maxOriginationFeeBps)}`,
            formatBps(bounds.defaults.originationFeeBps)
          ],
          [
            "Redemption fee",
            `at most ${formatBps(bounds.maxRedemptionFeeBps)}`,
            formatBps(bounds.defaults.redemptionFeeBps)
          ],
          [
            "Liquidation incentive",
            `at most ${formatBps(bounds.maxLiquidationIncentiveBps)}`,
            formatBps(bounds.defaults.liquidationIncentiveBps)
          ],
          [
            "Asset configuration",
            "maximum LTV strictly below the liquidation threshold, threshold at most 100%",
            "set per asset"
          ],
          ["Price feed decimals", `at most ${bounds.maxPriceFeedDecimals}`, "read from the feed"],
          ["Basis point base", `${bounds.bps} bps is 100%`, "constant"]
        ]}
      />

      <H2>The policy behind the numbers</H2>
      <P>
        Two ratios are set per asset and they answer different questions. The maximum LTV answers
        "how much may be owed against this", and it is what a borrower runs into. The liquidation
        threshold answers "when do we stop waiting", and it is what protects the pool. The distance
        between them is the only thing standing between a normal day and a liquidation, so it is set
        from how far the asset can move before a keeper can react, not from how much a borrower would
        like to draw.
      </P>
      <P>
        That distance is worth reading directly. At maximum draw, a position survives a fall of
        exactly <Mono>1 − maxLtv / liqThreshold</Mono> before it becomes liquidatable. A tokenized
        treasury bill barely moves and can carry a narrow gap; a single tokenized equity can gap
        overnight and gets a wide one. The tables below print that number for every configured asset
        so the choice is legible rather than implied.
      </P>
      <P>
        Fees are the other half. Because Safix charges for events and never for time, the fee schedule
        is the entire cost of borrowing, and it is bounded in the contract at a level well below what
        an interest rate would compound to. A position held for a decade costs what it cost on day
        one.
      </P>
      <P>
        That is the reasoning the current values follow. The formal risk parameter policy, meaning who
        sets these, against what evidence, and how often they are revisited, is still being written and
        is tracked in{" "}
        <a
          href="https://github.com/safixlabs/safix/issues/4"
          target="_blank"
          rel="noreferrer"
          className="text-mint transition-colors hover:text-fog"
        >
          safixlabs/safix#4
        </a>
        . Until it exists, treat the values below as what the contracts are configured with rather than
        as a committed schedule.
      </P>

      <H2>Caps</H2>
      <Callout title="There are no caps in the deployed contract yet" tone="warning">
        <p>
          The pool has no per-asset debt cap, no global debt ceiling, and no minimum position size.
          The only limits on drawing today are the per-asset maximum LTV and the pool's free
          liquidity. That is a deliberate gap rather than an omission from this page, and it is
          tracked in{" "}
          <a
            href="https://github.com/safixlabs/safix/issues/4"
            target="_blank"
            rel="noreferrer"
            className="text-mint transition-colors hover:text-fog"
          >
            safixlabs/safix#4
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/safixlabs/safix/issues/15"
            target="_blank"
            rel="noreferrer"
            className="text-mint transition-colors hover:text-fog"
          >
            safixlabs/safix#15
          </a>
          . When the fields exist on-chain, this page reads and prints them like every other parameter
          here.
        </p>
      </Callout>

      {states.map(state => (
        <section key={state.network.key}>
          <H2>{state.network.label}</H2>
          {state.snapshot ? (
            <DeployedParameters state={state} />
          ) : (
            <P>
              Nothing is deployed on {state.network.label.toLowerCase()} yet, so there are no live
              values to read. The bounds above still hold: they come from the contract source, not
              from a deployment. See the{" "}
              <Link href="/addresses/" className="text-mint transition-colors hover:text-fog">
                addresses page
              </Link>{" "}
              for what is deployed where.
            </P>
          )}
        </section>
      ))}

      <H2>Who can change these</H2>
      <P>
        Every parameter above is owner-only. Today the owner is the deploying key; before mainnet it
        becomes a multisig with a timelock on risk parameters, which is tracked in{" "}
        <a
          href="https://github.com/safixlabs/safix/issues/6"
          target="_blank"
          rel="noreferrer"
          className="text-mint transition-colors hover:text-fog"
        >
          safixlabs/safix#6
        </a>
        . Price pushes are the one exception: an asset with no Chainlink feed can have its price set
        by a separate price updater address, which the keeper uses and which cannot touch anything
        else. Assets with a feed take their price from the feed and ignore manual pushes entirely.
      </P>
      <P>
        No owner function moves collateral, cancels a position, or mints <Usdg />. The owner collects
        accrued protocol fees, configures assets, sets feeds, and adjusts fees within the bounds
        above. {live.length === 0 ? "Once a pool is deployed, its owner appears in the tables above." : ""}
      </P>
    </article>
  )
}
