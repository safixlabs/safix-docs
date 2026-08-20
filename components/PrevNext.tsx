"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { docPages, normalizePath } from "./nav"

export default function PrevNext() {
  const pathname = normalizePath(usePathname())
  const index = docPages.findIndex(page => normalizePath(page.href) === pathname)

  if (index === -1) return null

  const prev = docPages[index - 1]
  const next = docPages[index + 1]

  return (
    <nav className="mt-20 flex items-baseline justify-between gap-4 border-t border-ash pt-8">
      {prev ? (
        <Link
          href={prev.href}
          className="text-[14px] tracking-[-0.02em] text-graphite transition-colors hover:text-lake"
        >
          ← {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="text-right text-[14px] tracking-[-0.02em] text-graphite transition-colors hover:text-lake"
        >
          {next.title} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
