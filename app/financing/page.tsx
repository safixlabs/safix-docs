import { Card, CardGrid, DocHeader, H2, P, RowList } from "@/components/doc"
import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata(
  "/financing/",
  "There is no time-based interest anywhere in the network. Borrowers pay fixed one-time fees, and capital earns from real outcomes instead of the passage of time."
)

export default function FinancingPage() {
  return (
    <article>
      <DocHeader
        tag="Protocol"
        title="Financing model"
        lead="There is no time-based interest anywhere in the network. Borrowers pay fixed one-time fees, and capital earns from real outcomes instead of the passage of time."
      />

      <H2>Zero-interest credit line</H2>
      <P>
        The credit line follows the peer-to-pool model pioneered by Liquity. A borrower locks
        collateral, draws stablecoins, and pays everything up front. Nothing accrues afterwards: the
        debt on day one thousand is the same as the debt on day one.
      </P>
      <CardGrid>
        <Card title="Origination fee">
          Paid once when funds are drawn, for example 0.5% of the amount. This replaces the interest
          rate entirely.
        </Card>
        <Card title="Redemption fee">
          A fixed fee when the position is closed and the collateral is redeemed. Together with
          origination, it is the full cost of borrowing.
        </Card>
        <Card title="Stability pool returns">
          Liquidity providers earn discounted collateral from liquidations and protocol token rewards
          instead of interest.
        </Card>
      </CardGrid>

      <H2>Stability pool</H2>
      <P>
        The pool plays two roles. It is the source of every draw, and it is the buyer of last resort
        when a position is liquidated. Because returns come from liquidation gains and token rewards
        rather than a rate, providers earn from real events in the network instead of from time.
      </P>

      <H2>Profit and loss sharing</H2>
      <P>
        For financing tied to a business or a productive asset, Safix replaces the creditor relationship
        with an investment partnership. The financed party and the pool agree on a profit split before
        any capital moves.
      </P>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="Capital partnership">
          The pool provides the capital and the financed party operates it with their business or their
          tokenized assets. Profit is split at the agreed ratio, for example 60/40. If the venture
          loses money without misconduct or negligence, the loss falls on the capital, not the
          operator.
        </Card>
        <Card title="Joint venture">
          Pool funds and the pledged asset are deployed together in a single project. Income is
          distributed according to the agreed profit sharing ratio, and both sides carry the outcome of
          the venture.
        </Card>
      </div>

      <H2>Why this model</H2>
      <RowList
        items={[
          "Borrowing cost is known in full on day one and never grows.",
          "Provider returns come from real events in the network, liquidation gains and shared profits, not from the passage of time.",
          "Capital and risk stay aligned: whoever funds a venture carries its genuine losses."
        ]}
      />
    </article>
  )
}
