import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import Backdrop from "@/components/Backdrop"
import Sidebar from "@/components/Sidebar"
import MobileNav from "@/components/MobileNav"
import PrevNext from "@/components/PrevNext"
import SurfaceLinks from "@/components/SurfaceLinks"
import { absolute, baseUrl, self } from "@/lib/site"

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-src"
})

const surface = self()

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: {
    default: surface.name,
    template: `%s · ${surface.name}`
  },
  description: surface.description,
  applicationName: surface.name,
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: surface.name,
    url: absolute("/"),
    title: surface.name,
    description: surface.description,
    locale: "en_US",
    images: [{ url: "/og/index.png", width: 1200, height: 630, alt: surface.name }]
  },
  twitter: {
    card: "summary_large_image",
    title: surface.name,
    description: surface.description,
    images: ["/og/index.png"]
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070c0c" },
    { media: "(prefers-color-scheme: light)", color: "#f4f8f7" }
  ]
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
            <footer className="mt-16 border-t border-line pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4 text-[12px] tracking-[-0.02em] text-haze">
                <span>Safix</span>
                <SurfaceLinks />
                <span>©2026</span>
              </div>
            </footer>
          </div>
        </main>
      </body>
    </html>
  )
}
