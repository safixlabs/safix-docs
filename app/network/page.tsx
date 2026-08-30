import type { Metadata } from "next"
import { Card, CardGrid, DocHeader, H2, P, PillRow } from "@/components/doc"

export const metadata: Metadata = {
  title: "Network"
}

export default function NetworkPage() {
  return (
    <article>
      <DocHeader
        tag="Protocol"
        title="Network and contracts"
        lead="Safix runs on Robinhood Chain, the Arbitrum Orbit rollup built for tokenized stocks and real-world assets."
      />

      <H2>Why Robinhood Chain</H2>
      <P>
        Safix lends against tokenized stocks, so it lives where those assets are issued. Robinhood
        Chain is a permissionless, fully EVM-compatible layer 2 running Arbitrum Nitro: Solidity
        deploys unchanged, standard wallets work out of the box, and gas is paid in ETH. The public
        testnet opened in February 2026 and mainnet went live in July 2026.
      </P>
      <PillRow
        items={[
          "Mainnet · chain id 4663",
          "Testnet · chain id 46630",
          "Gas token · ETH",
          "Explorer · Blockscout"
        ]}
      />
      <P>
        Public RPC endpoints are rpc.mainnet.chain.robinhood.com and
        rpc.testnet.chain.robinhood.com. They are rate limited; production traffic should run through
        a dedicated provider.
      </P>

      <H2>Real assets on the chain</H2>
      <P>
        Robinhood Stock Tokens are standard ERC-20 assets with 18 decimals that can be held or
        transferred in any compatible wallet; KYB onboarding applies only to the authorized
        participants who mint and burn. That makes them usable as Safix collateral without issuer
        permission. Corporate actions arrive through the ERC-8056 scaled amount extension rather than
        rebasing, and every stock token ships a per-asset Chainlink feed whose price already includes
        that multiplier. Safix reads those feeds directly.
      </P>
      <P>
        The chain settles around USDG alongside bridged stablecoins. The pool contract takes its
        stable asset as a constructor parameter, so the deployed pool can denominate in whichever
        stablecoin has the deepest local liquidity.
      </P>

      <H2>Contract architecture</H2>
      <CardGrid>
        <Card title="SafixPool">
          The core. A USDC stability pool with Liquity-style accounting, per-asset collateral
          configuration, one-time fees, partial liquidation with a keeper incentive, and an optional
          passport gate on every draw.
        </Card>
        <Card title="PartnershipDesk">
          The profit and loss sharing track. Partnerships are funded pro rata, capital moves to the
          operator on activation, returns are reported onchain, and profit splits at the agreed ratio
          while genuine losses fall on the capital.
        </Card>
        <Card title="PassportRegistry">
          The credit passport anchor. Approved attesters write a five-check bitmask with optional
          expiry; the pool and any integrated platform can require a complete passport without seeing
          the data behind it.
        </Card>
      </CardGrid>

      <H2>Collateral control plane</H2>
      <P>
        The app is the control plane over these contracts: one view of collateral health, available
        credit, pool deposits, partnership stakes, and every attestation in force, read directly from
        chain state. Nothing shown there exists anywhere except onchain.
      </P>

      <H2>Status</H2>
      <P>
        All three contracts are implemented and covered by a 28-test Foundry suite, including the
        liquidation loss and gain distribution math, the partnership settlement split, and Chainlink
        feed pricing with staleness guards. An off-chain keeper discovers positions from events,
        pushes prices for assets without a feed, and liquidates unhealthy positions automatically; the
        full lifecycle including an automated keeper liquidation has been exercised end to end against
        a local devnet. Testnet deployment is the next step.
      </P>
    </article>
  )
}
