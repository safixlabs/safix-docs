import type { Metadata } from "next"
import FlowDiagram from "@/components/FlowDiagram"
import { DocHeader, H2, P, RowList } from "@/components/doc"

export const metadata: Metadata = {
  title: "How it works"
}

export default function HowItWorksPage() {
  return (
    <article>
      <DocHeader
        tag="Protocol"
        title="How it works"
        lead="Lenders fund a shared pool, borrowers lock tokenized assets, and the protocol keeps both sides protected."
      />

      <FlowDiagram />

      <H2>Lenders</H2>
      <P>Lenders deposit USDC into XYZ and earn interest on the capital they provide to the pool.</P>

      <H2>Borrowers</H2>
      <P>
        Borrowers lock approved tokenized assets as collateral and receive USDC from the lending pool.
        Once the loan and interest are repaid, the collateral is unlocked and returned to the borrower.
      </P>

      <H2>Liquidation</H2>
      <P>
        If the collateral value falls below the required level, XYZ can liquidate part of it to protect
        lenders. Partial liquidation restores the loan to a healthy ratio without closing the whole
        position.
      </P>

      <H2>Loan lifecycle</H2>
      <RowList
        items={[
          "A borrower locks approved tokenized assets as collateral.",
          "The network privately verifies ownership, value, eligibility, and existing debt.",
          "USDC is drawn from the lending pool and sent to the borrower.",
          "The borrower repays the loan plus interest.",
          "The collateral is unlocked. If its value drops below the required level before repayment, part of it is liquidated."
        ]}
      />
    </article>
  )
}
