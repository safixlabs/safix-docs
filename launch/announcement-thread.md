# Announcement thread

For X. Eleven posts. Written to be read by someone who has never heard of Safix
and does not care about protocol architecture, and to survive being read by
someone who does.

Attach `public/diagrams/credit-line.png` to post 4, `liquidation.png` to post 6
and `passport.png` to post 8. They are 1600×900 PNGs rendered from the SVGs next
to them.

Nothing in this thread claims a deployment, an audit, a partnership or a number
that does not exist. Before posting, check that every link resolves and that the
"where we are" post still describes where we are.

---

**1/**

You own a tokenized stock. You can hold it, or you can sell it.

That is the whole menu.

Safix adds a third option: borrow against it, at zero interest, without anyone
seeing what you own.

**2/**

Two problems sit on top of each other.

Tokenization made ownership programmable. It also made it public. A wallet
holding tokenized equities is a brokerage statement anyone can read — positions,
history, and the moment you borrow, your debts.

**3/**

The second problem is that almost nothing tokenized can be borrowed against.
The rails work, the assets exist, and then they sit there.

The largest asset class coming onchain has no working credit layer under it.

**4/**

So: lock the asset, draw a stablecoin, pay a one-time fee.

Not a rate. A fee, once, at the door. The debt on day one thousand is the debt
on day one.

Repay whenever you like and the collateral unlocks.

**5/**

Where does the money come from, if nobody is paid interest?

A stability pool. People deposit into it, every draw comes out of it, and it is
the buyer when a position is liquidated.

Providers earn from events in the network. Not from the passage of time.

**6/**

If collateral falls below the required level, anyone can liquidate the position.
Not a role, not a whitelist, not us — any funded wallet, paid a share of what it
seizes for doing it.

The rest goes to the pool. That is where provider returns come from.

**7/**

Now the private half.

A lender does not need your portfolio. They need five answers: do you own enough,
are you eligible, is your existing debt acceptable, is this collateral pledged
elsewhere, do you qualify.

**8/**

So that is all that goes onchain. Five bits and an expiry, written against an
address by an approved attester.

Anyone can ask one question of it: is this address eligible. True or false.

Identity, holdings, balances, loan details: never written, never inferable.

**9/**

And it is reusable. Verified once, presented anywhere — across wallets, chains
and lending platforms — without repeating the verification you already passed.

That is the credit passport, and it is the part we think matters most.

**10/**

Where we actually are, plainly:

Three contracts, live on Robinhood Chain Testnet. A keeper that liquidates
unhealthy positions on its own. An app and full documentation, live.

No independent audit yet, and testnet is not mainnet. Both of those matter more
than anything else in this thread.

**11/**

If you build a wallet, a lending platform or an RWA product, the interesting
question is whether you want to answer "can this user safely borrow against
these assets" yourself, or ask something that already can.

Docs, contracts and the app: [links]

---

## Notes for whoever posts this

- Replace `[links]` in post 11 with the real documentation and app URLs. Do not
  post a shortened link; use the domain once it is registered.
- Post 10 is the one to re-check before posting. It currently says testnet,
  which was true when this was written; if mainnet has happened by then, say so.
  Link the addresses page, which carries the live contracts.
- Do not add a token, a raise, a launch date or a yield figure to this thread.
  None of those exist, and the thread is credible because it does not reach for
  them.
