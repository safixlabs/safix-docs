# Public repository decision

**Status: not decided. Awaiting sign-off.**

This is the record for one decision: which Safix repositories become public, under
which licence, and when. It is written so the decision can be taken in one sitting
rather than researched again, and so that whoever takes it can see what it costs
either way.

The decision itself lives in `security.config.json` under `openSource`. Filling in
`opensAt` and `declaredLicense` there and re-running `npm run build:security`
publishes it everywhere it needs to appear. Nothing else has to be edited.

## Why it has to be taken before launch

Three things downstream of it are already blocked:

- **The bug bounty.** A bounty over code nobody can read is a bounty nobody can
  win. Scope, severity and rewards are all written; the programme is worth little
  while the contracts are private.
- **The security policy's reporting channel.** GitHub's private vulnerability
  reporting — the standard way to receive a report without publishing an email
  address — is only available on public repositories.
- **The claim the documentation makes.** The docs say the protocol is verifiable:
  parameters read from deployed contracts, ABIs published, revert strings taken
  from source. All of that is checkable against a deployment. The source itself is
  not, while it is private.

## What is in each repository

| Repository | Contents | Licence today |
| --- | --- | --- |
| `safixlabs/safix` | The three contracts, the Foundry test suite, the liquidation keeper, the information memorandum | Every Solidity file carries an `AGPL-3.0-only` SPDX header |
| `safixlabs/safix-app` | The application: borrow, pool, partnerships, passport, risk and terms screens | None declared |
| `safixlabs/safix-docs` | This documentation site and the generators behind it | None declared |

The contracts have effectively already chosen. Every `.sol` file in
`safixlabs/safix/contracts` declares `AGPL-3.0-only` at the top. What has not been
decided is whether a `LICENSE` file follows that header, and when the repository
holding it opens.

## Are they safe to open

Checked, rather than assumed:

- **No secrets are committed in any of the three.** A scan for private keys, API
  keys, auth tokens and PEM blocks across all tracked files found nothing.
- The two 32-byte hex values in `safixlabs/safix-app/e2e/deployment.ts` are the
  well-known public Anvil development keys, published in Foundry's own
  documentation. They fund nothing on any real chain.
- The Sentry DSN is read from `NEXT_PUBLIC_SENTRY_DSN` at build time and is not in
  the tree. Note that a DSN is public by design once the app ships — it is in the
  browser bundle either way — so opening the repository does not expose anything
  the application does not already expose.
- The keeper reads its private key from the environment. `config.example.json`
  contains zero addresses only.

Nothing in any repository has to be removed or rewritten before it can be opened.
That is worth knowing, because "we would have to clean it up first" is the usual
reason this decision slips.

## The options

### A. Contracts open, application and documentation closed

Open `safixlabs/safix` under AGPL-3.0-only, at the testnet deployment. Keep the other
two private.

- The bounty becomes real for the part where the money is.
- Private vulnerability reporting becomes available on the repository that needs
  it most.
- The parameters the docs publish become checkable against source.
- Nobody can audit the application's transaction construction, which is where a
  user actually signs.

### B. All three open

Contracts under AGPL-3.0-only; the application and the documentation under a
licence chosen for them.

- Every claim the documentation makes becomes checkable end to end.
- The bounty can cover the signing path, which is a real attack surface.
- A fork of the application is easy. AGPL on the contracts limits a hosted fork of
  the protocol; a permissive licence on the app does not.
- The design language and the copy become reusable by anyone, including someone
  building something that looks like Safix.

### C. Nothing opens until mainnet

- Zero exposure now.
- The bounty stays scoped-but-hollow, the reporting channel stays closed, and the
  documentation's verifiability claim stays partly unbacked through the whole
  testnet period, which is exactly the period when finding bugs is cheapest.

## Recommendation

**Option A at the testnet deployment, moving to B before mainnet.**

The reasoning: the contracts are where the money is and where an outside reader is
most useful, they already declare their licence, and they are clean to open today.
Opening them at the testnet deployment puts the code in front of people during the
period when a bug costs nothing but time. The application carries a genuine attack
surface too, but it changes faster and has more open pull requests against it;
opening it once it settles, before mainnet, gets the same benefit without churn.

Option C is the one to avoid. It saves nothing and delays the only period where
finding a critical bug is free.

## What has to happen when it is signed off

1. Set `opensAt` and `declaredLicense` for each repository in
   `security.config.json`.
2. Add the matching `LICENSE` file to each repository that opens.
3. Run `npm run build:security` in each and commit the regenerated `SECURITY.md`.
4. Flip the repository to public, then enable **Settings → Security → Private
   vulnerability reporting**, which needs an admin.
5. Set `contact.githubAdvisories` to true if that becomes the published channel,
   and regenerate again.
6. Fill in the bounty reward table and set `bounty.live`.

Steps 4 and 6 need someone with repository admin and someone who can commit money.
The rest is mechanical.
