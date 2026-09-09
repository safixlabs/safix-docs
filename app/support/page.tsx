import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardGrid, DocHeader, H2, P, RowList } from "@/components/doc"
import { docPages } from "@/components/nav"
import { linkIfPresent, reportingChannel, security } from "@/lib/security"

export const metadata: Metadata = {
  title: "Support",
  description:
    "Where to take a problem with Safix: what to read first, what belongs in the security channel, and who answers everything else."
}

export default function SupportPage() {
  const { support } = security()
  const channel = reportingChannel()
  const readFirst = [
    { href: linkIfPresent("/faq/", docPages), title: "Read the FAQ" },
    { href: linkIfPresent("/risk/", docPages), title: "Read the risk page" },
    { href: linkIfPresent("/parameters/", docPages), title: "See the current parameters" },
    { href: linkIfPresent("/how-it-works/", docPages), title: "Read how the network works" }
  ].filter((entry): entry is { href: string; title: string } => entry.href !== null)

  return (
    <article>
      <DocHeader
        tag="Reference"
        title="Support"
        lead="Where to take a problem, and which problems go somewhere else first."
      />

      <H2>Start here</H2>
      <P>
        Most of what goes wrong with a Safix position is not a fault. It is the protocol doing
        something the documentation already explains, at a moment nobody enjoys. These three pages
        answer the overwhelming majority of questions, and they answer them from the deployed
        contracts rather than from memory.
      </P>
      <CardGrid>
        <Card title="A transaction was rejected">
          Every revert the pool can throw is listed with what it means, so an error message maps to a
          cause rather than a shrug.
        </Card>
        <Card title="Something about the money">
          Why there is no interest, what a liquidation costs you, what happens when a price feed
          fails: the questions the model actually provokes.
        </Card>
        <Card title="What the numbers are">
          Fees, loan-to-value ratios and liquidation thresholds, read from the contracts that are
          deployed rather than described.
        </Card>
      </CardGrid>
      <div className="mt-6 flex flex-col gap-2.5">
        {readFirst.map(entry => (
          <Link
            key={entry.href}
            href={entry.href}
            className="text-[15px] tracking-[-0.02em] text-mint transition-colors hover:text-fog"
          >
            {entry.title} →
          </Link>
        ))}
      </div>

      <H2>If it is a vulnerability, it does not come here</H2>
      <P>
        Anything that could cost somebody their collateral or their deposit goes to the security
        channel, not to support, and never into a public issue. The{" "}
        <Link href="/security/" className="text-mint transition-colors hover:text-fog">
          security policy
        </Link>{" "}
        sets out how to report it, what happens afterwards, and the safe harbour that covers you for
        looking.
      </P>
      <P>
        {channel
          ? "That channel is open."
          : "That channel is not open yet either, and the security page says so plainly rather than pointing at an address nobody reads."}
      </P>

      <H2>Everything else</H2>
      {support.channel ? (
        <>
          <P>
            {support.channel === "email" ? "Email" : "Open a thread at"}{" "}
            <span className="text-mint">{support.url}</span>.
          </P>
          <RowList
            items={[
              `Answered by ${support.responders.join(", ")}.`,
              support.responseTargetHours
                ? `A first reply within ${support.responseTargetHours} hours.`
                : "No response time has been committed to.",
              "Include the network, the transaction hash if there is one, and what you expected to happen.",
              "Never include a private key, a seed phrase or a signature. Nobody working on Safix will ask for one."
            ]}
          />
        </>
      ) : (
        <>
          <div className="mt-8 rounded-[4px] border border-amber/40 bg-amber/10 p-6">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-fog">
              There is no published support channel yet
            </p>
            <p className="mt-2.5 text-[14px] leading-[1.65] tracking-[-0.02em] text-mist">
              No address, forum or room has been announced, and nobody has been named as answering
              one. Publishing a channel that nobody watches would be worse than saying this, so this
              is what the page says until there is one. The protocol is already live on testnet, so
              this is overdue rather than early.
            </p>
          </div>
          <P>
            When it opens, this page will carry the address, who answers it, and how quickly. Those
            three things are read from the same configuration the security policy uses, so the page
            cannot advertise a channel that has not been set up.
          </P>
        </>
      )}

      <H2>What nobody will ever ask you for</H2>
      <RowList
        items={[
          "Your private key or seed phrase. There is no support case that needs one.",
          "A signature, a transaction, or an approval sent to somebody who contacted you first.",
          "Payment to unlock, release, restore or recover a position. Nothing in Safix works that way.",
          "A screen share of your wallet."
        ]}
      />
      <P>
        Anyone asking for those is not from Safix, whatever the account is called. Support will never
        message you first.
      </P>
    </article>
  )
}
