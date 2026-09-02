import type { ReactNode } from "react"

export function PillTag({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-[3px] border border-line px-4 py-1.5 text-[12px] tracking-[-0.02em] text-mist">
      <span className="h-1.5 w-1.5 rounded-[3px] bg-mint" />
      {children}
    </p>
  )
}

export function DocHeader({ tag, title, lead }: { tag: string; title: string; lead: string }) {
  return (
    <header>
      <PillTag>{tag}</PillTag>
      <h1 className="mt-7 font-sans text-[36px] font-bold leading-[1.12] tracking-[-0.02em] text-fog md:text-[46px]">
        {title}
      </h1>
      <p className="mt-6 text-[16px] leading-[1.6] tracking-[-0.02em] text-mist md:text-[18px]">
        {lead}
      </p>
    </header>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-16 font-sans text-[26px] font-bold leading-[1.2] tracking-[-0.015em] text-fog md:text-[30px]">
      {children}
    </h2>
  )
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 text-[15px] leading-[1.65] tracking-[-0.02em] text-mist md:text-[16px]">
      {children}
    </p>
  )
}

export function RowList({ items }: { items: string[] }) {
  return (
    <ol className="mt-8 border-t border-line">
      {items.map((text, index) => (
        <li key={text} className="flex gap-5 border-b border-line py-4">
          <span className="w-7 shrink-0 pt-px text-[13px] tracking-[-0.02em] text-haze">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[15px] leading-[1.6] tracking-[-0.02em] text-mist">{text}</span>
        </li>
      ))}
    </ol>
  )
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[4px] border border-line bg-panel p-7">
      <h3 className="font-sans text-[19px] font-semibold leading-[1.3] tracking-[-0.01em] text-fog">{title}</h3>
      <p className="mt-3 text-[14px] leading-[1.6] tracking-[-0.02em] text-mist">{children}</p>
    </div>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="mt-8 grid gap-4 md:grid-cols-3">{children}</div>
}

export function Highlight({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-16 rounded-[4px] bg-teal-deep p-8 md:p-10">
      <h2 className="font-sans text-[24px] font-bold leading-[1.2] tracking-[-0.015em] text-mint md:text-[26px]">
        {title}
      </h2>
      <p className="mt-4 text-[15px] leading-[1.65] tracking-[-0.02em] text-fog/85 md:text-[16px]">
        {children}
      </p>
    </div>
  )
}

export function PillRow({ items }: { items: string[] }) {
  return (
    <div className="mt-7 flex flex-wrap gap-2.5">
      {items.map(item => (
        <span
          key={item}
          className="rounded-[3px] border border-line bg-panel px-4 py-2 text-[13px] tracking-[-0.02em] text-fog"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
