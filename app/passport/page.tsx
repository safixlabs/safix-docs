import type { Metadata } from "next"
import { Card, CardGrid, DocHeader, H2, P } from "@/components/doc"

export const metadata: Metadata = {
  title: "Collateral passport"
}

export default function PassportPage() {
  return (
    <article>
      <DocHeader
        tag="Protocol"
        title="Private collateral passport"
        lead="A reusable private proof that works across wallets, blockchains, and lending platforms."
      />

      <P>
        Instead of revealing an entire portfolio, a user presents proof that they hold enough verified
        assets and meet the counterparty's requirements. The passport is issued once and travels with
        the user.
      </P>

      <CardGrid>
        <Card title="Portable">
          One passport follows the user across wallets and chains instead of being tied to a single
          address.
        </Card>
        <Card title="Reusable">
          The same verified proof can be presented to any integrated platform without repeating the
          verification process.
        </Card>
        <Card title="Minimal">
          Counterparties see that the requirements are met, never the portfolio behind the proof.
        </Card>
      </CardGrid>

      <H2>Why it matters</H2>
      <P>
        Credit decisions today require either full onchain transparency or heavy institutional
        paperwork. The passport replaces both with a single private attestation that any integrated
        platform can trust.
      </P>
    </article>
  )
}
