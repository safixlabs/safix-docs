import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import Backdrop from "@/components/Backdrop"
import Sidebar from "@/components/Sidebar"
import MobileNav from "@/components/MobileNav"
import PrevNext from "@/components/PrevNext"

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
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("safix.theme");var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t}catch(e){}})()`
          }}
        />
      </head>
      <body>
        <Backdrop />
        <Sidebar />
        <MobileNav />
        <main className="md:pl-[264px]">
          <div className="mx-auto w-full max-w-[820px] px-6 py-14 md:px-16 md:py-20">
            {children}
            <PrevNext />
            <footer className="mt-16 flex items-baseline justify-between border-t border-line pt-6 text-[12px] tracking-[-0.02em] text-haze">
              <span>Safix</span>
              <span>©2026</span>
            </footer>
          </div>
        </main>
      </body>
    </html>
  )
}
