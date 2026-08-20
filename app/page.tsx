import Link from "next/link"
import { Card, CardGrid, DocHeader, H2, Highlight, P } from "@/components/doc"

export default function OverviewPage() {
  return (
    <article>
      <DocHeader
        tag="Introduction"
        title="Private credit for tokenized assets"
        lead="XYZ is a private credit network for tokenized stocks and real-world assets. It lets users borrow stablecoins against their investments without selling them or publicly exposing their portfolio."
      />

      <H2>What XYZ does</H2>
      <P>
        Holders of tokenized stocks, bonds, funds, real estate, and commodities lock them as collateral
        and receive USDC from a shared lending pool. The network verifies everything a lender needs to
        know about the collateral and the borrower while keeping the underlying data confidential.
      </P>
      <CardGrid>
        <Card title="Borrow, keep the asset">
          Access liquidity without selling investments or creating taxable events. Repay the loan and
          the collateral unlocks.
        </Card>
        <Card title="Verify privately">
          Ownership, value, eligibility, and existing debt are confirmed without revealing wallets,
          balances, or identity to the public.
        </Card>
        <Card title="One passport">
          A reusable private collateral passport carries the proof across wallets, blockchains, and
          lending platforms.
        </Card>
      </CardGrid>

      <Highlight title="In plain words">
        XYZ allows people to keep their tokenized investments, borrow stablecoins against them, and
        prove that they qualify, all without revealing their entire financial life to the public.
      </Highlight>

      <H2>Why it matters</H2>
      <P>
        Onchain finance makes ownership programmable but also makes it public, and it still treats
        tokenized real-world assets as things to hold rather than capital to build on. XYZ turns those
        assets into productive, private collateral.
      </P>
      <p className="mt-6">
        <Link
          href="/how-it-works/"
          className="text-[15px] tracking-[-0.02em] text-lake transition-colors hover:text-off-black"
        >
          Read how the network works →
        </Link>
      </p>
    </article>
  )
}
