import type { MetadataRoute } from "next"
import { docPages } from "@/components/nav"
import { absolute } from "@/lib/site"

export const dynamic = "force-static"

// Every documentation page, taken from the navigation so the sitemap cannot
// fall behind the site.
export default function sitemap(): MetadataRoute.Sitemap {
  return docPages.map(page => ({
    url: absolute(page.href),
    changeFrequency: "weekly",
    priority: page.href === "/" ? 1 : 0.7
  }))
}
