"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { docPages, normalizePath } from "./nav"

export default function MobileNav() {
  const pathname = normalizePath(usePathname())

  return (
    <div className="sticky top-0 z-10 border-b border-ash bg-parchment md:hidden">
      <div className="flex items-baseline justify-between px-6 pt-5">
        <Link href="/" className="font-serif text-[22px] tracking-[-0.02em] text-off-black">
          XYZ
        </Link>
        <span className="text-[11px] tracking-[-0.02em] text-smoke">Documentation</span>
      </div>
      <nav className="flex gap-5 overflow-x-auto px-6 pb-4 pt-3">
        {docPages.map(page => {
          const active = normalizePath(page.href) === pathname
          return (
            <Link
              key={page.href}
              href={page.href}
              className={`whitespace-nowrap text-[13px] tracking-[-0.02em] ${
                active ? "text-lake" : "text-graphite"
              }`}
            >
              {page.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
