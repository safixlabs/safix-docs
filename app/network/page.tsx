import type { Metadata } from "next"
import { Card, CardGrid, DocHeader, H2, P, PillRow, Usdg } from "@/components/doc"
import { protocolMeta } from "@/lib/protocol"

export const metadata: Metadata = {
  title: "Network"
}

export default function NetworkPage() {
  const meta = protocolMeta()

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
        The chain settles around <Usdg /> alongside bridged stablecoins, and an onchain asset registry
        enumerates every listed stock token. The pool contract takes its stable asset as a constructor
        parameter, so the deployed pool can denominate in whichever stablecoin has the deepest local
        liquidity; on mainnet that is <Usdg />.
      </P>

      <div className="mt-7 flex items-center gap-4 rounded-[4px] border border-line bg-panel/80 p-5">
        <img src="/usdg.png" alt="USDG logo" className="h-10 w-10 shrink-0 rounded-[3px]" />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-fog">USDG · Global Dollar</p>
          <p className="mt-1 break-all text-[12.5px] tracking-[-0.01em] text-haze">
            Mainnet 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168
          </p>
        </div>
      </div>

      <H2>Contract architecture</H2>
      <CardGrid>
        <Card title="SafixPool">
          The core. A <Usdg /> stability pool with Liquity-style accounting, per-asset collateral
          configuration, one-time fees, partial liquidation with a keeper incentive, and an optional
          passport gate on every draw.
        </Card>
        <Card title="PartnershipDesk">
          The profit and loss sharing track. Partnerships are funded pro rata, capital moves to the
          operator on activation, returns are reported onchain, settlement can require an independent auditor's approval, and
          profit splits at the agreed ratio while genuine losses fall on the capital.
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
        All three contracts are implemented and covered by a {meta.tests.total}-test Foundry suite with {meta.tests.invariants} stateful invariants over randomized action sequences, including the
        liquidation loss and gain distribution math, the partnership settlement split, and Chainlink
        feed pricing with staleness guards. An off-chain keeper discovers positions from events,
        pushes prices for assets without a feed, and liquidates unhealthy positions automatically; the
        full lifecycle including an automated keeper liquidation has been exercised end to end against
        a local devnet, and the deploy script has been simulated end to end against the live testnet RPC at about 10.1M gas, roughly 0.0002 ETH. Broadcasting it is the next step.
      </P>
    </article>
  )
}
