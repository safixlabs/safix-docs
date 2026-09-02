import type { Metadata } from "next"
import Link from "next/link"
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
        lead="Liquidity providers fund a stability pool, borrowers draw stablecoins against locked assets at zero interest, and the protocol keeps both sides protected."
      />

      <FlowDiagram />

      <H2>Liquidity providers</H2>
      <P>
        Liquidity providers deposit USDG into the stability pool. They earn no interest by design.
        Their return comes from liquidation gains, collateral acquired at a discount when positions are
        liquidated, and from protocol token rewards.
      </P>

      <H2>Borrowers</H2>
      <P>
        Borrowers lock approved tokenized assets as collateral and draw USDG from the pool. Instead of
        a running interest rate they pay a fixed one-time origination fee, so the debt stays exactly
        the same until it is repaid. Once the drawn amount is returned, the collateral is unlocked.
      </P>

      <H2>Partnership financing</H2>
      <P>
        For financing tied to a business or a productive asset, the pool can act as a partner instead
        of a creditor. Profit is shared at a pre-agreed ratio and genuine losses fall on the capital.
        The full structure is described in the{" "}
        <Link href="/financing/" className="text-mint transition-colors hover:text-fog">
          financing model
        </Link>
        .
      </P>

      <H2>Liquidation</H2>
      <P>
        If the collateral value falls below the required level, Safix liquidates part of it to protect
        the pool. The liquidated collateral flows to the stability pool at a discount and becomes part
        of liquidity provider returns. Partial liquidation restores the position to a healthy ratio
        without closing it.
      </P>

      <H2>Loan lifecycle</H2>
      <RowList
        items={[
          "A borrower locks approved tokenized assets as collateral.",
          "The network privately verifies ownership, value, eligibility, and existing debt.",
          "USDG is drawn from the stability pool for a fixed one-time origination fee. No interest starts accruing.",
          "The borrower repays exactly the amount drawn, whenever they choose.",
          "The collateral is unlocked after a fixed redemption fee. If its value drops below the required level before repayment, part of it is liquidated."
        ]}
      />
    </article>
  )
}
