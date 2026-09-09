import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardGrid, DocHeader, H2, P, PillRow, RowList } from "@/components/doc"
import { SEVERITIES, reportingChannel, security } from "@/lib/security"

export const metadata: Metadata = {
  title: "Security",
  description:
    "How to report a vulnerability in Safix, what happens after you do, what the bug bounty covers, and the safe harbour that protects you for looking."
}

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export default function SecurityPage() {
  const { disclosure, bounty, openSource } = security()
  const channel = reportingChannel()

  return (
    <article>
      <DocHeader
        tag="Reference"
        title="Security"
        lead="Safix holds other people's collateral and other people's deposits, and the contracts have not been through an independent audit. If you find something, we want to hear about it before anybody loses money."
      />

      <H2>Reporting a vulnerability</H2>
      {channel ? (
        <>
          <P>
            {channel.kind === "email" ? (
              <>
                Email <span className="text-mint">{channel.value}</span>. Include enough for us to
                reproduce it: the contract or the screen, the conditions it needs, and the impact you
                believe it has.
              </>
            ) : (
              <>
                Open a private security advisory on the repository, under Security → Report a
                vulnerability. It stays private to you and the maintainers until it is published.
              </>
            )}
          </P>
          <P>
            Please do not open a public issue, post it publicly, or test against funds that are not
            yours.
          </P>
        </>
      ) : (
        <>
          <div className="mt-8 rounded-[4px] border border-amber/40 bg-amber/10 p-6">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-fog">
              There is no published reporting channel yet
            </p>
            <p className="mt-2.5 text-[14px] leading-[1.65] tracking-[-0.02em] text-mist">
              The repositories are private and no security address has been announced, so someone
              outside the project has no way to report a vulnerability today, and no responsible way
              to publish one either. This has to be open before anything is deployed to a public
              chain. Until then, please do not disclose a finding publicly.
            </p>
          </div>
          <P>
            Everything below is the policy that channel will operate under. It is written, it is
            published, and it is what you can hold us to the moment there is an address to send to.
          </P>
        </>
      )}

      <H2>What happens after you report</H2>
      <RowList
        items={[
          `Acknowledgement within ${disclosure.acknowledgeWithinHours} hours.`,
          `Triage and a severity within ${disclosure.triageWithinDays} days, with the reasoning.`,
          `A fix targeted at ${disclosure.fixTargetDays.critical} days for critical, ${disclosure.fixTargetDays.high} for high, ${disclosure.fixTargetDays.medium} for medium and ${disclosure.fixTargetDays.low} for low.`,
          `Publication within ${disclosure.publicAfterFixDays} days of the fix shipping, crediting you unless you would rather we did not.`,
          `An embargo of no more than ${disclosure.maximumEmbargoDays} days. If we cannot fix it in that time we will say so and agree a date with you rather than let it sit.`
        ]}
      />

      <H2>Safe harbour</H2>
      {disclosure.safeHarbour ? (
        <>
          <P>
            We will not pursue or support legal action against anyone who reports in good faith under
            this policy, stays inside the scope below, does not access, modify or destroy anyone
            else's data, and gives us a reasonable chance to fix the problem before telling anyone
            else.
          </P>
          <P>
            If a third party brings action against you for research that followed this policy, we will
            make it known that it did.
          </P>
        </>
      ) : (
        <P>No safe harbour has been agreed for this policy yet.</P>
      )}

      <H2>What the bounty covers</H2>
      <RowList items={bounty.inScope} />

      <H2>What it does not</H2>
      <RowList items={bounty.outOfScope} />

      <H2>Rewards</H2>
      {bounty.live ? (
        <CardGrid>
          {SEVERITIES.map(severity => (
            <Card key={severity} title={capitalise(severity)}>
              {`${bounty.rewards[severity]} ${bounty.currency ?? ""}`.trim()}
            </Card>
          ))}
        </CardGrid>
      ) : (
        <>
          <P>
            The bug bounty is not live. The protocol is deployed to Robinhood Chain Testnet, where
            the tokens are test tokens and nothing at risk is worth anything, and no reward amounts
            have been signed off for mainnet. Publishing a table now would be a promise with no money
            behind it.
          </P>
          <P>
            The scope and the rules above are the programme. The reward table is the only part still
            missing, and it lands before the first mainnet transaction. Reports sent before then are
            still wanted, still triaged on the timelines above, and still credited.
          </P>
        </>
      )}

      <H2>Where the code is</H2>
      <P>
        The security policy is published in every Safix repository as{" "}
        <span className="text-fog">SECURITY.md</span>, generated from the same configuration as this
        page so the two cannot drift.
      </P>
      <PillRow items={Object.keys(openSource.repositories)} />
      <P>
        Which of them are public, under which licence and when, is{" "}
        {openSource.decided ? "decided" : `not decided yet, and due ${openSource.decisionDue}`}. A
        bounty over code nobody can read is worth little, so the two decisions travel together. For
        anything that is not a vulnerability, see the{" "}
        <Link href="/support/" className="text-mint transition-colors hover:text-fog">
          support path
        </Link>
        .
      </P>
    </article>
  )
}
