"use client"

import { useCallback, useEffect, useState } from "react"
import type { Abi } from "viem"
import { createPublicClient, formatUnits, http } from "viem"
import poolAbiJson from "@/data/protocol/abi/SafixPool.json"

const poolAbi = poolAbiJson as Abi

type AssetInput = {
  address: string
  symbol: string | null
  decimals: number | null
}

type Reading = {
  blockNumber: bigint
  totalDeposits: bigint
  availableLiquidity: bigint
  protocolFees: bigint
  originationFeeBps: number
  redemptionFeeBps: number
  prices: { address: string; symbol: string | null; price: bigint; updatedAt: bigint }[]
}

const usd = (value: bigint) =>
  Number(formatUnits(value, 18)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  })

// Matches formatBps in lib/protocol so the live figures read the same as the
// build-time ones rendered beside them.
const bps = (value: number) => {
  const percent = value / 100
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`
}

const amount = (value: bigint, decimals: number | null) =>
  Number(formatUnits(value, decimals ?? 18)).toLocaleString("en-US", { maximumFractionDigits: 2 })

export default function LivePoolState({
  rpcUrl,
  chainId,
  pool,
  stable,
  assets
}: {
  rpcUrl: string
  chainId: number
  pool: string
  stable: { symbol: string | null; decimals: number | null }
  assets: AssetInput[]
}) {
  const [reading, setReading] = useState<Reading | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const read = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const client = createPublicClient({ transport: http(rpcUrl) })
      const address = pool as `0x${string}`
      const onChainId = await client.getChainId()
      if (onChainId !== chainId) {
        throw new Error(`the endpoint answered for chain ${onChainId}, not ${chainId}`)
      }
      const call = <T,>(functionName: string, args?: unknown[]) =>
        client.readContract({ address, abi: poolAbi, functionName, args }) as Promise<T>

      const [
        blockNumber,
        totalDeposits,
        availableLiquidity,
        protocolFees,
        originationFeeBps,
        redemptionFeeBps
      ] = await Promise.all([
        client.getBlockNumber(),
        call<bigint>("totalDeposits"),
        call<bigint>("availableLiquidity"),
        call<bigint>("protocolFees"),
        call<number>("originationFeeBps"),
        call<number>("redemptionFeeBps")
      ])

      const prices = await Promise.all(
        assets.map(async asset => {
          const [price, updatedAt] = await call<[bigint, bigint]>("currentPrice", [asset.address])
          return { address: asset.address, symbol: asset.symbol, price, updatedAt }
        })
      )

      setReading({
        blockNumber,
        totalDeposits,
        availableLiquidity,
        protocolFees,
        originationFeeBps: Number(originationFeeBps),
        redemptionFeeBps: Number(redemptionFeeBps),
        prices
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message.split("\n")[0] : String(cause))
    } finally {
      setLoading(false)
    }
  }, [assets, chainId, pool, rpcUrl])

  useEffect(() => {
    read()
  }, [read])

  return (
    <div className="mt-8 rounded-[4px] border border-line bg-panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[14px] font-semibold tracking-[-0.01em] text-fog">
          Live pool state
          <span className="ml-2.5 text-[12px] font-normal text-haze">
            {loading
              ? "reading…"
              : reading
                ? `block ${reading.blockNumber.toString()}`
                : "unavailable"}
          </span>
        </p>
        <button
          type="button"
          onClick={read}
          disabled={loading}
          className="rounded-[3px] border border-line px-3 py-1 text-[12px] tracking-[-0.01em] text-mist transition-colors hover:border-mint hover:text-mint disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-[13.5px] leading-[1.6] tracking-[-0.02em] text-danger">
          The public endpoint did not answer: {error}. It is rate limited; a dedicated provider is the
          fix for anything beyond a spot check.
        </p>
      ) : null}

      {reading ? (
        <>
          <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-3">
            {[
              ["Total deposits", `${amount(reading.totalDeposits, stable.decimals)} ${stable.symbol ?? ""}`],
              [
                "Available liquidity",
                `${amount(reading.availableLiquidity, stable.decimals)} ${stable.symbol ?? ""}`
              ],
              ["Protocol fees", `${amount(reading.protocolFees, stable.decimals)} ${stable.symbol ?? ""}`],
              ["Origination fee", bps(reading.originationFeeBps)],
              ["Redemption fee", bps(reading.redemptionFeeBps)],
              ["Assets configured", String(reading.prices.length)]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] tracking-[-0.01em] text-haze">{label}</dt>
                <dd className="mt-1 text-[15px] tracking-[-0.01em] text-fog">{value}</dd>
              </div>
            ))}
          </dl>

          {reading.prices.length > 0 ? (
            <ul className="mt-6 border-t border-line">
              {reading.prices.map(price => (
                <li
                  key={price.address}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2.5 last:border-b-0"
                >
                  <span className="text-[13.5px] tracking-[-0.01em] text-mist">
                    {price.symbol ?? price.address}
                  </span>
                  <span className="text-[13.5px] tracking-[-0.01em] text-fog">
                    {usd(price.price)}
                    <span className="ml-2 text-[12px] text-haze">
                      updated {new Date(Number(price.updatedAt) * 1000).toISOString().replace("T", " ").slice(0, 19)} UTC
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      <p className="mt-5 text-[12.5px] leading-[1.6] tracking-[-0.02em] text-haze">
        Read in your browser from {rpcUrl} with the ABI published on this page. Nothing here is cached
        or pre-rendered.
      </p>
    </div>
  )
}
