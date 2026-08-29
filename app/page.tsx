import Link from "next/link"
import { Card, CardGrid, DocHeader, H2, Highlight, P } from "@/components/doc"

export default function OverviewPage() {
  return (
    <article>
      <DocHeader
        tag="Introduction"
        title="Private credit for tokenized assets"
        lead="Safix is a private credit network for tokenized stocks and real-world assets. It lets users borrow stablecoins against their investments without selling them or publicly exposing their portfolio."
      />

      <H2>What Safix does</H2>
      <P>
        Holders of tokenized stocks, bonds, funds, real estate, and commodities lock them as collateral
        and draw USDC from a shared pool at zero interest, or fund them through a profit sharing
        partnership. The network verifies everything a counterparty needs to know about the collateral
        and the borrower while keeping the underlying data confidential.
      </P>
      <CardGrid>
        <Card title="Borrow at zero interest">
          Access liquidity without selling. A fixed one-time fee replaces the interest rate, so debt
          never grows over time. Repay and the collateral unlocks.
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
        Safix allows people to keep their tokenized investments, draw stablecoins against them for a
        single fixed fee or a share of profits, and prove that they qualify, all without revealing
        their entire financial life to the public.
      </Highlight>

      <H2>Why it matters</H2>
      <P>
        Onchain finance makes ownership programmable but also makes it public, and it still treats
        tokenized real-world assets as things to hold rather than capital to build on. Safix turns those
        assets into productive, private collateral.
      </P>
      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href="/how-it-works/"
          className="text-[15px] tracking-[-0.02em] text-lake transition-colors hover:text-off-black"
        >
          Read how the network works →
        </Link>
        <Link
          href="/financing/"
          className="text-[15px] tracking-[-0.02em] text-lake transition-colors hover:text-off-black"
        >
          See the interest-free financing model →
        </Link>
      </div>
    </article>
  )
}
