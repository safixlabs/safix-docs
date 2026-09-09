import type { ReactNode } from "react"

const tones = {
  note: "border-line bg-panel text-mist",
  warning: "border-amber/40 bg-amber/10 text-mist"
} as const

export default function Callout({
  title,
  tone = "note",
  children
}: {
  title: string
  tone?: keyof typeof tones
  children: ReactNode
}) {
  return (
    <div className={`mt-8 rounded-[4px] border p-6 ${tones[tone]}`}>
      <p className="text-[14px] font-semibold tracking-[-0.01em] text-fog">{title}</p>
      <div className="mt-2.5 text-[14px] leading-[1.65] tracking-[-0.02em]">{children}</div>
    </div>
  )
}
