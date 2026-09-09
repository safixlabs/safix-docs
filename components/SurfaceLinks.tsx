import { allSurfaces, self } from "@/lib/site"

/**
 * Links to the other Safix surfaces. A surface with no address yet is left out
 * rather than linked to nowhere, so this renders the truth at build time.
 */
export default function SurfaceLinks({ className }: { className?: string }) {
  const here = self().key
  const others = allSurfaces().filter(surface => surface.key !== here && surface.url !== null)

  if (others.length === 0) return null

  return (
    <nav className={className ?? "flex flex-wrap items-baseline gap-5"}>
      {others.map(surface => (
        <a
          key={surface.key}
          href={surface.url as string}
          className="transition-colors hover:text-mint"
        >
          {surface.key === "marketing" ? "Safix" : surface.name} →
        </a>
      ))}
    </nav>
  )
}
