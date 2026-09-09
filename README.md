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
