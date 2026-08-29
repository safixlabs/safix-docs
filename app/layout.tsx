import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DM_Sans, Source_Serif_4 } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import MobileNav from "@/components/MobileNav"
import PrevNext from "@/components/PrevNext"

const serif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-src"
})

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-src"
})

export const metadata: Metadata = {
  title: {
    default: "Safix documentation",
    template: "%s · Safix documentation"
  },
  description:
    "Safix is a private credit network for tokenized stocks and real-world assets. Borrow stablecoins against your investments without selling them or exposing your portfolio."
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Sidebar />
        <MobileNav />
        <main className="md:pl-[264px]">
          <div className="mx-auto w-full max-w-[820px] px-6 py-14 md:px-16 md:py-20">
            {children}
            <PrevNext />
            <footer className="mt-16 flex items-baseline justify-between border-t border-ash pt-6 text-[12px] tracking-[-0.02em] text-smoke">
              <span>Safix</span>
              <span>A Safix project</span>
            </footer>
          </div>
        </main>
      </body>
    </html>
  )
}
