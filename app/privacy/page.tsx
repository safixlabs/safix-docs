import type { Metadata } from "next"
import { DocHeader, H2, P, PillRow, RowList } from "@/components/doc"

export const metadata: Metadata = {
  title: "Privacy layer"
}

export default function PrivacyPage() {
  return (
    <article>
      <DocHeader
        tag="Protocol"
        title="Privacy layer"
        lead="Safix verifies important financial facts without exposing the underlying data publicly."
      />

      <H2>What the network can confirm</H2>
      <P>A counterparty asking about a user receives verified answers to five questions:</P>
      <RowList
        items={[
          "The user owns enough approved collateral.",
          "The user meets identity and eligibility requirements.",
          "The user carries an acceptable level of debt.",
          "The same collateral is not being reused elsewhere.",
          "The user qualifies for the requested loan."
        ]}
      />

      <H2>What stays confidential</H2>
      <P>
        Counterparties learn the answer to their question and nothing else. The data behind the answer
        never becomes public:
      </P>
      <PillRow items={["Identity", "Exact holdings", "Wallet balances", "Loan details"]} />
    </article>
  )
}
