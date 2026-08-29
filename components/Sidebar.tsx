"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { docGroups, docPages, normalizePath } from "./nav"

export default function Sidebar() {
  const pathname = normalizePath(usePathname())

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[264px] flex-col justify-between overflow-y-auto border-r border-line bg-carbon/70 px-8 py-10 backdrop-blur-md md:flex">
      <div>
        <Link href="/" className="block">
          <span className="block font-sans text-[24px] font-bold leading-none tracking-[-0.01em] text-fog">Safix<span className="text-mint">.</span></span>
          <span className="mt-2.5 block text-[12px] leading-snug tracking-[-0.02em] text-haze">
            Private credit for tokenized assets
          </span>
        </Link>
        <nav className="mt-12 flex flex-col gap-9">
          {docGroups.map(group => (
            <div key={group}>
              <p className="text-[12px] tracking-[-0.02em] text-haze">{group}</p>
              <ul className="mt-3.5 flex flex-col gap-3 border-l border-line">
                {docPages
                  .filter(page => page.group === group)
                  .map(page => {
                    const active = normalizePath(page.href) === pathname
                    return (
                      <li key={page.href}>
                        <Link
                          href={page.href}
                          className={`-ml-px block border-l pl-4 text-[14px] tracking-[-0.02em] transition-colors ${
                            active
                              ? "border-mint text-mint"
                              : "border-transparent text-mist hover:text-fog"
                          }`}
                        >
                          {page.title}
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <p className="mt-12 text-[12px] tracking-[-0.02em] text-haze">©2026 Safix</p>
    </aside>
  )
}
