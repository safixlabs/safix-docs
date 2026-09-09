import type { Metadata } from "next"
import Link from "next/link"
import Callout from "@/components/Callout"
import { Mono, Table } from "@/components/Table"
import { Card, DocHeader, H2, P, Usdg } from "@/components/doc"
import { formatBps, limits, networkStates, protocolMeta, riskDisclosure } from "@/lib/protocol"

export const metadata: Metadata = {
  title: "Risk",
  description:
    "What can go wrong when borrowing against tokenized assets on Safix, in the same words the application shows before a wallet is connected."
}

export default function RiskPage() {
  const disclosure = riskDisclosure()
  const meta = protocolMeta()
  const bounds = limits()
  const live = networkStates().find(state => state.snapshot !== null)?.snapshot ?? null
  const incentiveBps = live?.pool.liquidationIncentiveBps ?? bounds.defaults.liquidationIncentiveBps

  return (
    <article>
      <DocHeader
        tag="Reference"
        title="Risk"
        lead="Safix lends against tokenized securities. Everything below can cost you money, and none of it is hypothetical."
      />

      <P>
        This is the same disclosure the application shows before a wallet is connected. It is not a
        summary of it: the wording here is generated from the app's own source, so the two cannot
        drift apart. What the docs add is the mechanism underneath each one.
      </P>

      <H2>What can go wrong</H2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {disclosure.items.map(item => (
          <Card key={item.title} title={item.title}>
            {item.body}
          </Card>
        ))}
      </div>
      <P>{disclosure.closing}</P>

      <H2>What a liquidation actually does to you</H2>
      <P>
        A position becomes liquidatable when its collateral value, discounted by the asset's
        liquidation threshold, no longer covers the debt. Anyone can then call{" "}
        <Mono>liquidate</Mono>. They do not need permission, they do not need to be us, and they are
        paid {formatBps(incentiveBps)} of the collateral they cause to be seized, which is what makes
        it happen quickly.
      </P>
      <P>
        Liquidation does not have to close the position. The caller chooses how much of the debt to
        offset, the pool seizes collateral in the same proportion, and what is left stays open with
        less of both. While the collateral is still worth more than the debt, which is the case
        liquidation exists to catch, you give up more value than the debt it cleared. That difference
        is the liquidity providers' return and it is your loss, and repaying afterwards does not bring
        it back.
      </P>
      <Table
        head={["What happens", "Who it affects"]}
        rows={[
          ["Debt is reduced by the amount the caller offsets", "Borrower, in their favour"],
          ["Collateral is seized in proportion to the debt offset", "Borrower, permanently"],
          [
            `${formatBps(incentiveBps)} of the seized collateral goes to whoever called liquidate`,
            "Liquidator, as the incentive"
          ],
          [
            "The rest of the seized collateral is distributed across stability pool deposits",
            "Liquidity providers, as the gain"
          ],
          [
            "Stability pool deposits fall by the debt that was offset",
            "Liquidity providers, as the cost"
          ],
          [
            "If the collateral is already worth less than the debt, the pool absorbs the shortfall",
            "Liquidity providers, as a loss"
          ]
        ]}
      />
      <P>
        The last row is the one liquidity providers should read twice. Depositing into the stability
        pool is not lending at a rate. It is agreeing to buy collateral at a discount, with{" "}
        <Usdg /> you have already committed, at a moment you do not choose. When the price gaps faster
        than a keeper reacts, the collateral seized can be worth less than the debt it cleared, and the
        pool carries that difference. There is no reserve behind it today; a bad debt policy and a
        reserve fund are tracked in{" "}
        <a
          href="https://github.com/safixlabs/safix/issues/5"
          target="_blank"
          rel="noreferrer"
          className="text-mint transition-colors hover:text-fog"
        >
          safixlabs/safix#5
        </a>
        .
      </P>

      <H2>What protects you, and what does not</H2>
      <Table
        head={["Guard", "What it does", "What it does not do"]}
        rows={[
          [
            "Maximum LTV",
            "Refuses a draw that would put debt above the asset's limit, including the origination fee.",
            "Nothing after the draw. Prices move; the limit does not follow them."
          ],
          [
            "Liquidation threshold",
            "Sets the point where liquidation becomes possible, above the maximum LTV.",
            "Guarantee a liquidation happens there. It happens when somebody calls it."
          ],
          [
            "Price staleness guard",
            "Blocks draws, collateral withdrawals and liquidations on a price older than the pool's limit.",
            "Make a stale price correct. It stops the protocol, it does not fix the feed."
          ],
          [
            "Reentrancy guard and invariant tests",
            "Cover the accounting the contracts were tested against.",
            "Substitute for an independent audit, which has not happened."
          ],
          [
            "Passport gate",
            "Restricts who can draw when a registry is configured.",
            "Vouch for the borrower's solvency, or protect the pool from a price fall."
          ]
        ]}
      />

      <Callout title="No audit yet" tone="warning">
        <p>
          The contracts carry {meta.tests.total} tests, {meta.tests.invariants} of them stateful
          invariants over randomised action sequences, and they have not been through an independent
          security audit. That audit is
          tracked separately from launch, and until it is done the honest description of the software
          risk is the one above: assume it can fail.
        </p>
      </Callout>

      <H2>Where the numbers are</H2>
      <P>
        The thresholds that decide all of this are per asset and they are published rather than
        described. The{" "}
        <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
          parameter reference
        </Link>{" "}
        prints the maximum LTV, the liquidation threshold, and the price fall each asset survives at
        maximum draw, read from the deployed contracts. The{" "}
        <Link href="/faq/" className="text-mint transition-colors hover:text-fog">
          FAQ
        </Link>{" "}
        covers what happens in the cases people ask about most.
      </P>
      <P>
        The application's own disclosure, which is the one that binds when you use it, is at{" "}
        <a
          href="https://safix-app.vercel.app/risk/"
          target="_blank"
          rel="noreferrer"
          className="text-mint transition-colors hover:text-fog"
        >
          the app's risk page
        </a>
        .
      </P>
    </article>
  )
}
