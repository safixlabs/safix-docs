import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { Mono } from "@/components/Table"
import { DocHeader, H2, P, Usdg } from "@/components/doc"
import { formatBps, limits, networkStates, protocolMeta } from "@/lib/protocol"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers to the questions the Safix model provokes: why there is no interest, what a liquidation costs, what the passport reveals, and what happens when a price feed fails."
}

function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="border-b border-line py-7 last:border-b-0">
      <h3 className="font-sans text-[18px] font-semibold leading-[1.35] tracking-[-0.01em] text-fog">
        {q}
      </h3>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-[1.65] tracking-[-0.02em] text-mist">
        {children}
      </div>
    </div>
  )
}

export default function FaqPage() {
  const bounds = limits()
  const meta = protocolMeta()
  const snapshot = networkStates().find(state => state.snapshot !== null)?.snapshot ?? null
  const pool = snapshot?.pool ?? null
  const origination = formatBps(pool?.originationFeeBps ?? bounds.defaults.originationFeeBps)
  const redemption = formatBps(pool?.redemptionFeeBps ?? bounds.defaults.redemptionFeeBps)
  const incentive = formatBps(pool?.liquidationIncentiveBps ?? bounds.defaults.liquidationIncentiveBps)
  const asDeployed = pool ? "" : " as the contract is configured before deployment"

  return (
    <article>
      <DocHeader
        tag="Reference"
        title="Frequently asked questions"
        lead="The questions this model actually provokes, answered from what the contracts do rather than from what the marketing says."
      />

      <H2>The financing model</H2>
      <div className="mt-6 border-t border-line">
        <Question q="Why is there no interest? What is the catch?">
          <p>
            The catch is that you pay everything at the start and at the end instead of over time. A
            draw costs an origination fee of {origination}{asDeployed}, which is added to the debt on
            the same transaction, and closing the position costs a redemption fee of {redemption} on
            everything ever drawn against it. Between those two moments the debt does not move. It is
            the same number after ten years as after one day.
          </p>
          <p>
            That is not a loophole or a subsidy. It changes who carries the time risk. A lender
            charging interest is paid for waiting; the Safix pool is not paid for waiting, it is paid
            when something happens: a draw, a close, a liquidation, a settled partnership. If nothing
            happens, nobody earns. That is the trade.
          </p>
        </Question>
        <Question q="So how do liquidity providers make money?">
          <p>
            From liquidations, and from protocol token rewards. When a position is liquidated the
            collateral is seized and distributed to stability pool depositors, while their deposits
            fall by the debt that was offset. Depositors are effectively buying collateral at a
            discount using capital they have already committed. When the collateral is worth more than
            the debt it cleared, that is a gain; when it keeps falling, it is not.
          </p>
          <p>
            This is why the pool is not a savings account. It has no rate, and it is not risk free.
            The{" "}
            <Link href="/risk/" className="text-mint transition-colors hover:text-fog">
              risk page
            </Link>{" "}
            sets out what that means in practice.
          </p>
        </Question>
        <Question q="If debt never grows, what stops someone borrowing and never repaying?">
          <p>
            Nothing needs to. The collateral is locked in the contract and it is worth more than the
            debt. A borrower who never repays simply never gets their collateral back, and if its
            value falls to the liquidation threshold it is sold into the pool to clear the debt.
            Walking away is a choice the borrower is free to make and the pool is already covered for.
          </p>
        </Question>
        <Question q="Is the origination fee taken out of what I receive?">
          <p>
            No. Drawing 1,000 transfers 1,000 to your wallet and records a debt of 1,000 plus the fee.
            The fee is part of what you owe, which also means it counts against your loan-to-value
            limit at the moment you draw. That is the single most common surprise when integrating,
            and the{" "}
            <Link href="/integration/" className="text-mint transition-colors hover:text-fog">
              integration guide
            </Link>{" "}
            gives the exact formula for the maximum drawable amount.
          </p>
        </Question>
      </div>

      <H2>Liquidation</H2>
      <div className="mt-6 border-t border-line">
        <Question q="What actually happens when I get liquidated?">
          <p>
            When your collateral value, discounted by that asset's liquidation threshold, no longer
            covers your debt, anyone may call <Mono>liquidate</Mono> on your position. They choose how
            much of the debt to offset. The contract seizes collateral in proportion, pays the caller{" "}
            {incentive} of what it seized as the incentive, and hands the rest to the stability pool.
            Your debt falls by the amount offset and your collateral falls by more.
          </p>
          <p>
            The position is not closed. Liquidation is partial by construction, so what remains stays
            open and can be repaid, topped up, or liquidated again. Nothing is returned to you
            afterwards, and repaying later does not undo it.
          </p>
        </Question>
        <Question q="Will I be warned first?">
          <p>
            No. Liquidation is a permissionless call that anyone with a funded wallet can make the
            moment the position crosses the line, and the incentive exists precisely so that someone
            does it quickly. There is no grace period in the contract and no notification.
          </p>
          <p>
            What you can do is watch the number. The price at which a position becomes liquidatable is
            computable ahead of time from the debt, the collateral and the asset's threshold; the app
            shows it and the integration guide gives the formula.
          </p>
        </Question>
        <Question q="How far can the price fall before that happens?">
          <p>
            It depends on the asset and on how much you drew. At the maximum draw the answer is
            exactly one minus the ratio of the maximum LTV to the liquidation threshold, and the{" "}
            <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
              parameter reference
            </Link>{" "}
            prints that figure for every configured asset. Drawing less than the maximum widens it
            proportionally.
          </p>
        </Question>
        <Question q="Who runs the liquidations?">
          <p>
            Anyone who wants the incentive. Safix runs a keeper, and its code is public and documented
            in the{" "}
            <Link href="/keeper/" className="text-mint transition-colors hover:text-fog">
              keeper guide
            </Link>{" "}
            so that other people can run one too. The protocol does not depend on ours in particular;
            it depends on at least one existing, which is what the incentive pays for.
          </p>
        </Question>
      </div>

      <H2>Privacy and the passport</H2>
      <div className="mt-6 border-t border-line">
        <Question q="What does the passport actually reveal on-chain?">
          <p>
            A bitmask and an expiry, written against an address by an approved attester. The mask has{" "}
            {bounds.passport.checks} bits, one per check, and the pool asks a single question of it:{" "}
            <Mono>isEligible</Mono>, which is true when all {bounds.passport.checks} bits are set and
            the attestation has not expired. That is the entire on-chain footprint.
          </p>
          <p>
            What is not on-chain: your identity, your holdings anywhere else, your balances, your
            income, the documents behind the checks, and which attester decided what. An observer
            reading the registry learns that some address passed five checks and when that expires. It
            does not learn who the address belongs to or why they passed.
          </p>
        </Question>
        <Question q="Can the passport be revoked?">
          <p>
            Yes. An attester can revoke an attestation at any time, which deletes the record and makes{" "}
            <Mono>isEligible</Mono> false immediately. Attestations may also carry an expiry and go
            stale on their own. Revocation blocks new draws; it does not touch existing positions,
            collateral, or the ability to repay.
          </p>
        </Question>
        <Question q="Do I need a passport to use Safix?">
          <p>
            Only to draw, and only when the pool has a registry configured. Depositing to the stability
            pool, repaying, closing a position, and calling liquidate are never gated. Whether the
            gate is on for a given deployment is itself readable on-chain and is printed on the{" "}
            <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
              parameter reference
            </Link>
            .
          </p>
        </Question>
        <Question q="If my portfolio is private, how does the pool know the collateral is real?">
          <p>
            Because the collateral is not described to the pool, it is handed to it. Locking
            collateral is an ERC-20 transfer into the contract, so the pool holds the tokens and
            values them from a price feed. There is nothing to take on trust about the amount. The
            private verification sits around eligibility and identity, which is what the passport
            answers, not around whether the assets exist.
          </p>
        </Question>
      </div>

      <H2>Prices and failure</H2>
      <div className="mt-6 border-t border-line">
        <Question q="What happens if the price feed fails?">
          <p>
            The protocol stops rather than guesses. A Chainlink feed that returns a non-positive
            answer or a round that was never updated makes every call that needs a price revert. A
            feed that is merely stale, older than the pool's configured maximum price age, blocks
            draws, collateral withdrawals and liquidations with <Mono>stale price</Mono>.
          </p>
          <p>
            The consequence is symmetric and worth understanding before it happens: while a feed is
            down you cannot draw, and nobody can liquidate you either. Positions freeze in place.
            Repaying and closing still work, because neither needs a price. When the feed recovers,
            everything that was true underneath becomes actionable at once, including liquidations
            that would have fired during the outage.
          </p>
        </Question>
        <Question q="What if the price is wrong rather than missing?">
          <p>
            Then the protocol acts on it. The staleness guard checks age, not correctness, and a feed
            reporting a live but wrong price will be used. This is the single largest external
            dependency in the system. Per-asset sanity bounds and a sequencer uptime check are being
            added for exactly this reason and are tracked in{" "}
            <a
              href="https://github.com/safixlabs/safix/issues/2"
              target="_blank"
              rel="noreferrer"
              className="text-mint transition-colors hover:text-fog"
            >
              safixlabs/safix#2
            </a>
            .
          </p>
        </Question>
        <Question q="Some assets have no feed. Who sets their price?">
          <p>
            A dedicated price updater address, which the owner configures and which can do nothing
            else. It cannot move funds, change fees, or configure assets. Once an asset has a
            Chainlink feed wired to it, the feed wins and manual pushes are ignored entirely for that
            asset. Which assets are on which source is printed on the{" "}
            <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
              parameter reference
            </Link>
            .
          </p>
        </Question>
      </div>

      <H2>The rest</H2>
      <div className="mt-6 border-t border-line">
        <Question q="Can I withdraw from the stability pool whenever I like?">
          <p>
            Whenever there is idle liquidity. Withdrawals are paid from what the pool is not currently
            lending out, so a withdrawal larger than the free balance reverts with{" "}
            <Mono>illiquid</Mono> until borrowers repay or positions are liquidated. Free liquidity is
            a public number and is read live on the{" "}
            <Link href="/addresses/" className="text-mint transition-colors hover:text-fog">
              addresses page
            </Link>
            .
          </p>
        </Question>
        <Question q="What is the difference between the credit line and a partnership?">
          <p>
            The credit line is collateralised and you owe a fixed amount. A partnership is not: the
            desk funds an operator, the operator reports returns on-chain, and profit is split at the
            agreed ratio while genuine losses fall on the capital. There is no collateral and no
            principal protection. The{" "}
            <Link href="/financing/" className="text-mint transition-colors hover:text-fog">
              financing model
            </Link>{" "}
            covers both.
          </p>
        </Question>
        <Question q="Has this been audited?">
          <p>
            No. The contracts carry {meta.tests.total} tests, {meta.tests.invariants} of them stateful
            invariants over randomised action sequences, and an independent security audit has not
            been done. It is tracked separately from launch. Until then, treat the software risk as
            real.
          </p>
        </Question>
        <Question q="Is the code public?">
          <p>
            The contracts are licensed{" "}
            <Mono>{meta.contracts[0]?.license ?? "AGPL-3.0-only"}</Mono> in their source headers and
            their ABIs are published from this site. What gets opened, when, and under which licence
            is a decision still being made, tracked in{" "}
            <a
              href="https://github.com/safixlabs/safix-docs/issues/3"
              target="_blank"
              rel="noreferrer"
              className="text-mint transition-colors hover:text-fog"
            >
              safixlabs/safix-docs#3
            </a>
            .
          </p>
        </Question>
        <Question q="Where do I report a problem?">
          <p>
            A security contact and a disclosure policy are being published as part of{" "}
            <a
              href="https://github.com/safixlabs/safix-docs/issues/3"
              target="_blank"
              rel="noreferrer"
              className="text-mint transition-colors hover:text-fog"
            >
              safixlabs/safix-docs#3
            </a>
            . Until that lands, the honest answer is that there is no published address yet, and this
            page will carry it the moment there is. Do not disclose a vulnerability in a public issue.
          </p>
        </Question>
      </div>

      <P>
        Something missing? The{" "}
        <Link href="/integration/" className="text-mint transition-colors hover:text-fog">
          integration guide
        </Link>{" "}
        covers the mechanics in code, and every parameter these answers depend on is read from the
        deployed contracts on the{" "}
        <Link href="/parameters/" className="text-mint transition-colors hover:text-fog">
          parameter reference
        </Link>
        . <Usdg /> amounts, addresses and fees on this site are generated, never typed.
      </P>
    </article>
  )
}
