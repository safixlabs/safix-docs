import type { Metadata } from "next"
import { Card, CardGrid, DocHeader, H2, P, RowList } from "@/components/doc"

export const metadata: Metadata = {
  title: "Economics"
}

export default function EconomicsPage() {
  return (
    <article>
      <DocHeader
        tag="Network"
        title="Economics"
        lead="How value flows through the network and who benefits from it."
      />

      <H2>Revenue model</H2>
      <P>XYZ generates revenue at every point where the network creates value:</P>
      <RowList
        items={[
          "Loan origination fees",
          "A percentage of borrower interest",
          "Private verification fees",
          "Liquidation fees",
          "RWA issuer integrations",
          "Lending platform integrations",
          "Business subscriptions and API access"
        ]}
      />

      <H2>Who benefits</H2>
      <CardGrid>
        <Card title="Users">
          Access liquidity without selling investments, creating taxable events, or exposing financial
          information publicly.
        </Card>
        <Card title="Lenders">
          Earn interest while receiving verified information about collateral value, borrower
          eligibility, existing debt, and overall loan risk.
        </Card>
        <Card title="RWA platforms">
          Make issued assets more useful by letting holders borrow against them, without building
          lending, privacy, and verification infrastructure in house.
        </Card>
      </CardGrid>
    </article>
  )
}
