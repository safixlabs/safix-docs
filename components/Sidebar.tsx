"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ThemeToggle from "./ThemeToggle"
import { docGroups, docPages, normalizePath } from "./nav"
import { allSurfaces, self } from "@/lib/site"

export default function Sidebar() {
  const pathname = normalizePath(usePathname())
  const here = self().key
  const elsewhere = allSurfaces().filter(surface => surface.key !== here && surface.url !== null)

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[264px] flex-col justify-between overflow-y-auto border-r border-line bg-carbon/70 px-8 py-10 backdrop-blur-md md:flex">
      <div>
        <Link href="/" className="block">
          <span className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-7 w-7" />
            <span className="font-sans text-[24px] font-bold leading-none tracking-[-0.01em] text-fog">Safix</span>
          </span>
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
        {elsewhere.length > 0 ? (
          <div className="mt-11 border-t border-line pt-6">
            <p className="text-[12px] tracking-[-0.02em] text-haze">Elsewhere</p>
            <ul className="mt-3.5 flex flex-col gap-2.5">
              {elsewhere.map(surface => (
                <li key={surface.key}>
                  <a
                    href={surface.url as string}
                    className="flex items-baseline justify-between text-[14px] tracking-[-0.02em] text-mist transition-colors hover:text-mint"
                  >
                    {surface.key === "marketing" ? "Safix" : surface.name}
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="mt-12 flex items-center justify-between gap-3">
        <p className="text-[12px] tracking-[-0.02em] text-haze">©2026 Safix</p>
        <ThemeToggle />
      </div>
    </aside>
  )
}
