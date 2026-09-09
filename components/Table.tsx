import type { ReactNode } from "react"

export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[4px] border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-panel">
            {head.map((cell, index) => (
              <th
                key={index}
                className="whitespace-nowrap px-4 py-3 text-[12px] font-medium tracking-[-0.01em] text-haze"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 align-top text-[13.5px] leading-[1.55] tracking-[-0.01em] text-mist"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className="break-all font-mono text-[12.5px] text-fog">{children}</span>
}
