"use client"

import { useState } from "react"

export default function CodeBlock({
  code,
  language,
  caption
}: {
  code: string
  language?: string
  caption?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure className="mt-6">
      <div className="overflow-hidden rounded-[4px] border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-haze">{language ?? "code"}</span>
          <button
            type="button"
            onClick={copy}
            className="rounded-[3px] border border-line px-2.5 py-1 text-[11px] tracking-[-0.01em] text-mist transition-colors hover:border-mint hover:text-mint"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-[1.65] text-fog">
          <code>{code}</code>
        </pre>
      </div>
      {caption ? (
        <figcaption className="mt-2.5 text-[13px] leading-[1.6] tracking-[-0.02em] text-haze">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
