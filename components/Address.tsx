"use client"

import { useState } from "react"

export default function Address({
  value,
  explorerUrl,
  label
}: {
  value: string
  explorerUrl?: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {explorerUrl ? (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all font-mono text-[12.5px] text-mist underline decoration-line underline-offset-4 transition-colors hover:text-mint"
          aria-label={label ? `${label} on the block explorer` : "View on the block explorer"}
        >
          {value}
        </a>
      ) : (
        <span className="break-all font-mono text-[12.5px] text-mist">{value}</span>
      )}
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-[3px] border border-line px-2 py-0.5 text-[11px] tracking-[-0.01em] text-haze transition-colors hover:border-mint hover:text-mint"
        aria-label={label ? `Copy ${label}` : "Copy address"}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  )
}
