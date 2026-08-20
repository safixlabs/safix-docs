import type { Metadata } from "next"
import { Card, DocHeader, H2, P, RowList } from "@/components/doc"

export const metadata: Metadata = {
  title: "Problem and solution"
}

export default function ProblemPage() {
  return (
    <article>
      <DocHeader
        tag="Introduction"
        title="The problem and the solution"
        lead="Tokenized assets are public by default and financially idle. XYZ addresses both at once."
      />

      <H2>The problem</H2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="Public by default">
          Blockchain activity is publicly visible. When users hold tokenized stocks or RWAs, anyone can
          inspect their wallets, balances, transactions, and financial positions.
        </Card>
        <Card title="Limited utility">
          Most holders can only hold or sell these assets, while borrowing against them remains
          difficult, fragmented, or limited to institutional platforms.
        </Card>
      </div>

      <H2>The solution</H2>
      <P>
        XYZ allows users to lock tokenized stocks, bonds, funds, real estate, commodities, and other
        RWAs as collateral to borrow stablecoins.
      </P>
      <P>
        Financing is interest-free by design. Borrowers pay fixed one-time fees, or the pool joins
        them as a partner and shares profit and loss. Debt never grows with time.
      </P>
      <P>Before any loan is issued, the platform privately verifies four things about the collateral:</P>
      <RowList
        items={[
          "The collateral is real and exists as claimed.",
          "It is valuable enough to support the requested loan.",
          "It is eligible for use as collateral on the network.",
          "It is not already securing another loan."
        ]}
      />
    </article>
  )
}
