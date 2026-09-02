"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { docPages, normalizePath } from "./nav"

export default function MobileNav() {
  const pathname = normalizePath(usePathname())

  return (
    <div className="sticky top-0 z-10 border-b border-line bg-carbon/80 backdrop-blur-md md:hidden">
      <div className="flex items-baseline justify-between px-6 pt-5">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="h-6 w-6" />
          <span className="font-sans text-[20px] font-bold tracking-[-0.01em] text-fog">Safix</span>
        </Link>
        <span className="text-[11px] tracking-[-0.02em] text-haze">Documentation</span>
      </div>
      <nav className="flex gap-5 overflow-x-auto px-6 pb-4 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {docPages.map(page => {
          const active = normalizePath(page.href) === pathname
          return (
            <Link
              key={page.href}
              href={page.href}
              className={`whitespace-nowrap text-[13px] tracking-[-0.02em] ${
                active ? "text-mint" : "text-mist"
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
