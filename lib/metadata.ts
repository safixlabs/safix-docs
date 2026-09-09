// Per-page metadata, derived rather than repeated.
//
// A page states its own description and nothing else. Its title comes from the
// navigation, its canonical URL from the surface configuration, and its social
// preview from the image build-og.mjs rendered for that same route, so a page
// cannot end up with a title in one place and a card in another.

import type { Metadata } from "next"
import { docPages, normalizePath } from "@/components/nav"
import { absolute, self } from "./site"

/** public/og file name for a route, matching slugOf in scripts/build-og.mjs. */
export const ogSlug = (href: string): string => {
  const trimmed = href.replace(/^\/+|\/+$/g, "")
  return trimmed === "" ? "index" : trimmed.replace(/\//g, "-")
}

export function pageMetadata(href: string, description: string): Metadata {
  const page = docPages.find(candidate => normalizePath(candidate.href) === normalizePath(href))
  if (!page) throw new Error(`${href} is not in components/nav.ts, so it has no title to publish`)

  const surface = self()
  const image = `/og/${ogSlug(href)}.png`
  const title = normalizePath(href) === "/" ? surface.name : `${page.title} · ${surface.name}`

  return {
    title: normalizePath(href) === "/" ? undefined : page.title,
    description,
    alternates: { canonical: href },
    openGraph: {
      type: "website",
      siteName: surface.name,
      url: absolute(href),
      title,
      description,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: `${page.title} · ${surface.name}` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  }
}
