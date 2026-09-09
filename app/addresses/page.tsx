import type { Metadata } from "next"
import Address from "@/components/Address"
import Callout from "@/components/Callout"
import CodeBlock from "@/components/CodeBlock"
import LivePoolState from "@/components/LivePoolState"
import { Mono, Table } from "@/components/Table"
import { DocHeader, H2, P } from "@/components/doc"
import {
  explorerAddressUrl,
  formatToken,
  networkStates,
  protocolMeta,
  shortCommit,
  type NetworkState
} from "@/lib/protocol"

export const metadata: Metadata = {
  title: "Deployed addresses",
  description:
    "Every Safix contract address on Robinhood Chain testnet and mainnet, generated from the protocol repository's deployment records and read back from the chain."
}

function NetworkFacts({ state }: { state: NetworkState }) {
  const { network, deployment, snapshot } = state
  return (
    <Table
      head={["Property", network.label]}
      rows={[
        ["Network", network.name],
        ["Chain id", <Mono key="id">{String(network.chainId)}</Mono>],
        ["RPC", <Mono key="rpc">{network.rpcUrl}</Mono>],
        [
          "Explorer",
          <a
            key="explorer"
            href={network.explorer.url}
            target="_blank"
            rel="noreferrer"
            className="text-mint transition-colors hover:text-fog"
          >
            {network.explorer.name ?? network.explorer.url}
          </a>
        ],
        ["Foundry profile", <Mono key="profile">{network.foundryProfile}</Mono>],
        [
          "Deploy block",
          deployment?.deployBlock !== null && deployment?.deployBlock !== undefined ? (
            <Mono key="block">{String(deployment.deployBlock)}</Mono>
          ) : (
            "—"
          )
        ],
        [
          "Built from commit",
          deployment?.commit ? <Mono key="commit">{shortCommit(deployment.commit)}</Mono> : "—"
        ],
        [
          "State read at block",
          snapshot ? <Mono key="read">{String(snapshot.blockNumber)}</Mono> : "—"
        ]
      ]}
    />
  )
}

function DeployedNetwork({ state }: { state: NetworkState }) {
  const { network, deployment, snapshot } = state
  if (!deployment) return null

  const contractRows = Object.entries(deployment.contracts).map(([name, address]) => [
    <Mono key="name">{name}</Mono>,
    <Address
      key="address"
      value={address}
      label={name}
      explorerUrl={explorerAddressUrl(network, address)}
    />
  ])

  const tokenRows = Object.entries(deployment.tokens).map(([symbol, address]) => [
    <Mono key="symbol">{symbol}</Mono>,
    <Address
      key="address"
      value={address}
      label={symbol}
      explorerUrl={explorerAddressUrl(network, address)}
    />
  ])

  return (
    <>
      <NetworkFacts state={state} />

      <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
        Contracts
      </h3>
      <Table head={["Contract", "Address"]} rows={contractRows} />

      {tokenRows.length > 0 ? (
        <>
          <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
            Tokens
          </h3>
          <Table head={["Symbol", "Address"]} rows={tokenRows} />
        </>
      ) : null}

      {snapshot ? (
        <>
          <h3 className="mt-10 font-sans text-[19px] font-semibold tracking-[-0.01em] text-fog">
            Pool state
          </h3>
          <P>
            The stability pool holds{" "}
            {formatToken(snapshot.pool.totalDeposits, snapshot.pool.stable.decimals, snapshot.pool.stable.symbol)}{" "}
            in deposits with{" "}
            {formatToken(
              snapshot.pool.availableLiquidity,
              snapshot.pool.stable.decimals,
              snapshot.pool.stable.symbol
            )}{" "}
            free to draw, across{" "}
            {`${snapshot.pool.assets.length} configured collateral ${
              snapshot.pool.assets.length === 1 ? "asset" : "assets"
            }`}
            . The numbers below are read again in your browser every time this page loads.
          </P>
          <LivePoolState
            rpcUrl={network.rpcUrl}
            chainId={network.chainId}
            pool={snapshot.pool.address}
            stable={{ symbol: snapshot.pool.stable.symbol, decimals: snapshot.pool.stable.decimals }}
            assets={snapshot.pool.assets.map(asset => ({
              address: asset.address,
              symbol: asset.symbol,
              decimals: asset.decimals
            }))}
          />
        </>
      ) : null}

      <P>
        Generated from <Mono>{deployment.source}</Mono> in the protocol repository.
      </P>
    </>
  )
}

function UndeployedNetwork({ state }: { state: NetworkState }) {
  const { network } = state
  return (
    <>
      <NetworkFacts state={state} />
      <Callout title={`No Safix deployment on ${network.label.toLowerCase()} yet`} tone="warning">
        <p>
          The chain itself is live and this page confirmed it: the endpoint above answered for chain id{" "}
          {network.chainId} when this site was built. What does not exist yet is a Safix deployment on
          it, so there is no address to publish and nothing to read.
        </p>
        <p className="mt-3">
          This section fills itself in. The moment{" "}
          <Mono>deployments/{network.key}.json</Mono> lands in the protocol repository, the next docs
          build picks up the addresses, reads the deployed contracts, and renders them here. Nothing on
          this page is typed by hand, so nothing has to be edited when that happens. The deployment is
          tracked in{" "}
          <a
            href="https://github.com/safixlabs/safix/issues/1"
            target="_blank"
            rel="noreferrer"
            className="text-mint transition-colors hover:text-fog"
          >
            safixlabs/safix#1
          </a>
          .
        </p>
      </Callout>
    </>
  )
}

export default function AddressesPage() {
  const states = networkStates()
  const meta = protocolMeta()
  const deployed = states.filter(state => state.deployment !== null)

  return (
    <article>
      <DocHeader
        tag="Build"
        title="Deployed addresses"
        lead="Every contract address Safix has on a public chain, together with the chain it lives on and the commit it was built from."
      />

      <H2>Where these come from</H2>
      <P>
        This page is generated, not written. A sync step reads the deployment records committed in the
        protocol repository, expands the short commit each broadcast was built from into the full hash,
        checksums every address, and confirms each RPC endpoint really answers for the chain id it
        claims. A second step connects to those endpoints and reads the deployed contracts back. If an
        address is wrong here, it is wrong in the deployment record, and both are fixed in one place.
      </P>
      <CodeBlock
        language="shell"
        code={`# in the docs repository, with safixlabs/safix and safixlabs/safix-app checked out alongside
npm run sync

# or point it at checkouts elsewhere
SAFIX_REPO=../safix SAFIX_APP_REPO=../safix-app npm run sync`}
        caption="Regenerating data/protocol. The build never reaches the network; only this step does."
      />

      {states.map(state => (
        <section key={state.network.key}>
          <H2>{state.network.label}</H2>
          {state.deployment ? (
            <DeployedNetwork state={state} />
          ) : (
            <UndeployedNetwork state={state} />
          )}
        </section>
      ))}

      <H2>Provenance</H2>
      <Table
        head={["Source", "Value"]}
        rows={[
          ["Protocol repository", <Mono key="repo">{meta.protocolRepo}</Mono>],
          [
            "Protocol commit",
            meta.protocolCommit ? <Mono key="commit">{shortCommit(meta.protocolCommit)}</Mono> : "—"
          ],
          ["Generated at", <Mono key="at">{meta.syncedAt}</Mono>],
          [
            "Networks with a deployment",
            deployed.length > 0 ? deployed.map(state => state.network.label).join(", ") : "none yet"
          ]
        ]}
      />
    </article>
  )
}
