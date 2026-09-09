# Credit that does not charge you for waiting

*The long-form launch post. Written for someone who owns tokenized assets and has
never thought about lending protocols. Roughly a nine minute read. Publish on the
marketing site or wherever long-form goes; the thread links to it.*

---

There is a particular kind of frustration in owning something valuable that you
cannot do anything with.

Tokenization worked. Treasuries, funds, corporate bonds, commodities and now
equities exist onchain as ordinary transferable tokens. The issuance layer
matured, the custody question got answered, and a genuinely large amount of value
moved. That was the hard part, and it is done.

Then the assets arrive and sit there. For most people holding a tokenized stock,
there are exactly two things they can do with it: keep it, or sell it. Borrowing
against it is fragmented, institutional, paperwork-bound, or simply unavailable.
This is strange, because borrowing against securities is one of the oldest and
most boring products in finance. Every private bank offers it. Onchain, where the
collateral is programmable and the price feed is already there, it mostly does
not exist.

The second problem is worse, and less discussed.

## Everything you own is on a billboard

Blockchains are public by default. That is a feature for settlement and a
catastrophe for personal finance. A wallet holding tokenized equities is a
brokerage statement anyone can read: what you own, how much, when you bought it,
and — from the moment you borrow — what you owe and how close you are to being
liquidated.

Nobody runs their finances in a window display. Not individuals, and certainly
not the institutions everyone keeps saying are about to arrive. A credit market
cannot be built inside one either: the moment your position is public, it is also
a target. Anyone can see where your liquidation sits and decide whether pushing
the price there is worth it.

So the two problems compound. The assets cannot be borrowed against, and the ones
that can be would expose you for doing it.

## What Safix does

Safix is a private credit layer for tokenized assets. You lock an approved
tokenized asset as collateral, draw a stablecoin against it, and prove you
qualify without showing anyone your portfolio.

Three things make that work, and they are worth taking one at a time.

### One: the loan does not grow

Most lending charges for time. You borrow, and every block you owe slightly more,
compounding quietly until you look up one day and the debt has taken a shape you
did not choose.

Safix charges for events instead. Drawing costs a one-time origination fee, added
to your debt at the moment you draw. Closing the position costs a fixed
redemption fee. Between those two moments nothing happens. The debt on day one
thousand is the debt on day one, to the last unit.

This is not a gimmick and it is not a subsidy. It is a different answer to the
question of who carries time risk. A lender charging interest is being paid to
wait. The Safix pool is not paid to wait — it is paid when something happens: a
draw, a close, a liquidation, a settled partnership. If nothing happens, nobody
earns. That is the trade, and it is an honest one.

It also means the cost of borrowing is a number you can know completely before
you sign anything. Not a rate that might change. A figure.

### Two: the pool, not a rate

If nobody is paid interest, where does the lending capital come from?

A stability pool. People deposit a stablecoin into it. Every draw comes out of
it. And when a position falls below its required collateral level, the pool is
the buyer: it absorbs the debt and receives the collateral at a discount.

That discount, together with protocol rewards, is where provider returns come
from. Providers are not lending at a rate. They are agreeing to buy collateral
cheaply, with capital they have already committed, at a moment they do not
choose.

It is worth being blunt about what that means, because a lot of onchain products
describe this kind of position as a yield and leave it there. Depositing into the
stability pool is not a savings account. When the collateral seized is worth more
than the debt it cleared, you gain. When the price gaps faster than anyone can
react and the collateral is worth less than the debt, the pool carries the
difference. There is no rate that makes that untrue, and pretending otherwise
would be the first dishonest thing on this page.

### Three: liquidation is everyone's job

When a position crosses its liquidation threshold, anyone can close part of it.
Not a privileged keeper, not a whitelist, not us. Any funded wallet can call the
function, and whoever does is paid a share of the collateral they cause to be
seized.

This is deliberate. A protocol whose safety depends on one operator being awake
is a protocol with an operator-shaped hole in it. Paying strangers to do the job
means it gets done by whoever is fastest, and the code that does it is published
so anyone can run one.

Liquidation is also partial. The caller chooses how much debt to clear and the
pool seizes collateral in proportion; what is left stays open, and can be repaid,
topped up, or liquidated again. Nothing about it is pleasant if you are the
borrower, and nothing about it is hidden.

## The private half

Everything above is a lending protocol. Useful, but not the reason to build it.

Think about what a lender actually needs to know before extending credit against
an asset. Not your name, not your holdings, not your history. Five things:

1. Do you own enough approved collateral.
2. Do you meet identity and eligibility requirements.
3. Is your existing debt acceptable.
4. Is this collateral already pledged somewhere else.
5. Do you qualify for the loan you are asking for.

That is the entire question. Everything else a lender might see is incidental —
and onchain, incidental means permanent and public.

So Safix separates the checking from the disclosure. An approved attester does
the work off-chain, against documents and balances that never leave that step.
What gets written onchain is a bitmask and an expiry against an address: five
bits, one per check. Anyone can then ask the registry a single question —
`isEligible(address)` — and get true or false.

That is the whole onchain footprint. An observer learns that some address passed
five checks, and when that lapses. They do not learn who the address belongs to,
what it holds, what it owes, or why it passed. There is no version of this where
a counterparty sees your portfolio and promises not to look.

### The passport is the part that compounds

Verification is annoying once and unbearable repeatedly. The point of writing the
result to a registry rather than handing a lender a document is that the proof
becomes portable: verified once, presented anywhere, across wallets, chains and
lending platforms.

Every platform that accepts a Safix passport makes it more useful to hold one,
and every passport in circulation makes it more sensible for the next platform to
accept it. That is the part we think matters most in five years, and it is the
part that has nothing to do with lending at all.

## For businesses, a different shape

Not all financing should be a loan. If capital is going into a business or a
productive asset, a fixed obligation is the wrong instrument: the borrower
carries all the downside and the lender takes none of it.

Safix has a second track for this, where the pool acts as a partner rather than a
creditor. Capital goes in, the operator runs it, returns are reported onchain,
and profit is split at a ratio agreed before any money moves. Genuine losses,
without misconduct, fall on the capital.

Whoever funds a venture carries its risk. That is not a moral position, it is
just what makes credit honest when there is no collateral to seize.

## Where this actually is

Being specific matters more than sounding ready.

Three contracts exist and are implemented: the stability pool with its
loss-accounting, the partnership desk, and the passport registry. They carry a
Foundry test suite that includes stateful invariants driving randomised sequences
of actions, and the full lifecycle has been exercised end to end — draw, price
fall, automated liquidation, provider gains, partnership settlement. A keeper
discovers positions from events and liquidates unhealthy ones on its own. The
application and the documentation are live.

The contracts are deployed to Robinhood Chain Testnet and readable there, with
the addresses published in the documentation and every parameter read back off
the chain rather than described.

What does not exist yet: an independent security audit, and a mainnet
deployment. Both are next, in that order of importance. Testnet tokens are worth
nothing, which is the point of a testnet; until the audit is done, the honest
description of the software risk is that the code is new and can fail, and
nobody should deposit on mainnet what they cannot afford to lose.

We would rather say that here than have you find out later that we knew.

## What to do with this

If you hold tokenized assets and have wanted liquidity without selling, the app
is the place to start, and the documentation explains every parameter the
protocol runs on, read from the deployed contracts rather than described from
memory.

If you build a wallet, a lending platform or an RWA product, the more interesting
question is whether you want to answer "can this user safely and legally borrow
against these assets" yourself, or ask something that already can. The passport
registry is a small contract with a published ABI and a single function that
matters.

And if you find a way to break any of it, there is a security policy that tells
you how to tell us.

---

*Nothing here is investment advice. Borrowing against tokenized securities can
cost you your collateral, and providing liquidity to the stability pool can lose
money. The risk page sets out how, in detail, and it is worth reading before the
marketing.*
