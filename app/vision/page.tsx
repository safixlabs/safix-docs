import type { Metadata } from "next"
import { DocHeader, H2, P, PillRow } from "@/components/doc"

export const metadata: Metadata = {
  title: "Vision"
}

export default function VisionPage() {
  return (
    <article>
      <DocHeader
        tag="Network"
        title="Vision"
        lead="XYZ aims to become the private credit and collateral layer for onchain finance."
      />

      <H2>Competitive advantage</H2>
      <P>
        Existing platforms usually focus on either RWA lending, institutional privacy, identity
        verification, or asset tokenization. XYZ combines all four within one network and adds a
        financing model the others do not offer:
      </P>
      <PillRow
        items={[
          "Private collateral verification",
          "Cross-chain financial identity",
          "Interest-free financing",
          "Lending infrastructure",
          "RWA utility"
        ]}
      />

      <H2>The question the network answers</H2>
      <blockquote className="mt-8 border-l-2 border-lake pl-6 font-serif text-[24px] italic leading-[1.35] tracking-[-0.02em] text-off-black md:text-[26px]">
        "Can this user safely and legally borrow against these assets?"
      </blockquote>
      <P>
        Any wallet, lender, RWA platform, or financial application could use XYZ to answer it privately.
        Whoever answers that question for the whole ecosystem becomes the credit layer beneath it.
      </P>
    </article>
  )
}
