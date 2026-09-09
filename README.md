# Safix docs

Documentation site for [Safix](https://github.com/safixlabs/safix), the private credit network for tokenized stocks and real-world assets.

Built with Next.js and Tailwind CSS v4, statically exported. Design language matches the Safix site: carbon black canvas, mint accent, DM Sans throughout.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

The static site is written to `out/`.

## Security policy, bug bounty and support

The security policy, the bug bounty and the support path are published from
[`security.config.json`](security.config.json), the same file in all three Safix
repositories. `SECURITY.md` is generated from it, and the `/security/` and
`/support/` pages read it directly, so a timeline or a scope line cannot say one
thing here and another next door.

```
npm run build:security   # regenerate SECURITY.md
npm run check:security   # verify the policy is consistent, and list what is undecided
```

The generators will not invent a reporting channel or a reward. Where the
configuration is null the published page says the decision has not been taken,
because a policy pointing at an address nobody reads is worse than one that admits
there is none yet. `check:security` names each outstanding decision and runs in CI
before the build.

## Launch material

[`launch/`](launch) holds what an outsider needs on launch day, ready to publish:

- [`announcement-thread.md`](launch/announcement-thread.md) — eleven posts, with
  notes on which diagram to attach where.
- [`announcement-post.md`](launch/announcement-post.md) — the long-form piece the
  thread links to.
- [`public-repository-decision.md`](launch/public-repository-decision.md) — the
  decision record for what opens, under which licence and when. Awaiting sign-off.

The diagram set is in [`public/diagrams/`](public/diagrams): the credit line, the
liquidation flow and the passport, as SVG with a 1600×900 PNG next to each for
anywhere that cannot render SVG. The SVGs are the source; the PNGs are rendered
from them.
## Domains and the three surfaces

Safix has three surfaces: the marketing site on the apex domain, the application
on `app.`, and this documentation on `docs.`. That structure lives in
[`site.config.json`](site.config.json), which is the same file in all three
repositories and the only place any of them names a hostname.

Registering the domain is a one-value change. Set `domain` in that file (or
`NEXT_PUBLIC_SAFIX_DOMAIN` at build time) and every canonical URL, `og:url`,
social preview image, sitemap entry, `robots.txt` host, cross-link to the other
surfaces and the redirect from the old hostname follows from it. Until it is set,
each surface stays on the generated hostname recorded in `currentUrl`, and a
surface with no address is left unlinked rather than linked to nowhere.

```
npm run build:assets   # preview images, touch icons and vercel.json
npm run check:site     # verifies the config and the generated assets agree
```

`build:assets` runs three generators:

- **`build:og`** renders one social preview image per page into `public/og/`,
  taking the page list from `components/nav.ts` and the hostname from the surface
  configuration. They are real `.png` files rather than a generated route, so
  every crawler gets `image/png` whatever the host does with extensionless paths.
- **`build:icons`** renders the touch icons from `app/icon.png` onto the carbon
  canvas, because iOS and Android ignore transparency on a home screen icon.
- **`build:config`** writes `vercel.json`, including the permanent redirect from
  the generated hostname to the real one once a domain is set.

`check:site` runs in CI before the build.

## The architecture poster

`public/architecture.svg` is the one-page picture of how value moves: who pays
what, in which direction, and which arrows are money rather than permission. It
is served at `/architecture.svg`, with a 1600 by 1000 PNG next to it at
`/architecture.png` for anywhere that cannot render SVG.

## Generated protocol data

Nothing in the reference pages is typed by hand. Addresses, ABIs, fees, loan-to-value ratios, liquidation thresholds, price feeds, revert strings and the risk disclosure are all generated into `data/protocol/` and committed, so the build itself never touches the network.

```
# with safixlabs/safix and safixlabs/safix-app checked out alongside this repository
npm run sync

# or point it at checkouts elsewhere
SAFIX_REPO=../safix SAFIX_APP_REPO=../safix-app npm run sync
```

`npm run sync` runs two steps:

- **`sync:protocol`** builds the contracts with Foundry and writes their ABIs to `data/protocol/abi/` and `public/abi/`, reads the bounds and revert strings out of the Solidity source, counts the test suite, resolves the networks from `foundry.toml` and the app's chain definitions (confirming each RPC really answers for the chain id it claims), reads the app's risk disclosure so the docs cannot drift from it, and picks up any deployment record from `deployments/<network>.json` or the Foundry broadcast.
- **`sync:chain`** connects to each network that has a deployment and reads the deployed contracts: fees, per-asset configuration, price feeds, pool balances and ownership. `SAFIX_RPC_TESTNET` and `SAFIX_RPC_MAINNET` override the endpoint it reads through, which is how the pipeline is verified against a local node.

Networks with no deployment record are rendered as such. When `deployments/<network>.json` lands in the protocol repository, the next sync fills the pages in with no page edits.

`npm run check:generated` verifies the generated tree is internally consistent, and runs in CI before the build.

## Requirements for `npm run sync`

- [Foundry](https://getfoundry.sh) on the path, for `forge build`
- Checkouts of `safixlabs/safix` and `safixlabs/safix-app`
- Network access to the Robinhood Chain RPC endpoints
