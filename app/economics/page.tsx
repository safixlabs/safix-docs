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
      <P>Safix charges for events, not for time. Revenue comes from:</P>
      <RowList
        items={[
          "One-time loan origination fees",
          "Redemption fees",
          "Private verification fees",
          "Liquidation fees",
          "A protocol share of partnership profits",
          "RWA issuer integrations",
          "Lending platform integrations",
          "Business subscriptions and API access"
        ]}
      />

      <H2>Who benefits</H2>
      <CardGrid>
        <Card title="Users">
          Access liquidity without selling investments, creating taxable events, or exposing financial
          information publicly. Debt stays fixed from day one.
        </Card>
        <Card title="Liquidity providers">
          Earn liquidation gains, protocol token rewards, and a share of partnership profits, with
          verified information about collateral quality and overall risk.
        </Card>
        <Card title="RWA platforms">
          Make issued assets more useful by letting holders borrow against them, without building
          lending, privacy, and verification infrastructure in house.
        </Card>
      </CardGrid>
    </article>
  )
}
