type NodeProps = {
  x: number
  y: number
  w: number
  label: string
  accent?: boolean
}

function Node({ x, y, w, label, accent }: NodeProps) {
  const h = 44
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={accent ? "#cfdaf5" : "#f6f3f1"}
        stroke="#cecac8"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4.5}
        textAnchor="middle"
        fill="#242424"
        className="font-sans text-[13px] tracking-[-0.02em]"
      >
        {label}
      </text>
    </g>
  )
}

function EdgeLabel({
  x,
  y,
  text,
  anchor = "middle"
}: {
  x: number
  y: number
  text: string
  anchor?: "start" | "middle" | "end"
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill="#797776" className="font-sans text-[11px] tracking-[-0.02em]">
      {text}
    </text>
  )
}

export default function FlowDiagram() {
  return (
    <figure className="mt-10 rounded-[24px] border border-ash p-4 md:p-8">
      <svg
        viewBox="0 0 720 330"
        role="img"
        aria-label="Flow of funds and collateral in the XYZ network"
        className="h-auto w-full"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#797776" />
          </marker>
        </defs>

        <line x1="182" y1="70" x2="274" y2="70" stroke="#cecac8" strokeWidth="1.25" markerEnd="url(#arrow)" />
        <line x1="446" y1="70" x2="550" y2="70" stroke="#cecac8" strokeWidth="1.25" markerEnd="url(#arrow)" />
        <path
          d="M290 92 C258 118 218 118 190 96"
          fill="none"
          stroke="#cecac8"
          strokeWidth="1.25"
          markerEnd="url(#arrow)"
        />
        <path
          d="M614 96 C606 190 540 262 460 262"
          fill="none"
          stroke="#cecac8"
          strokeWidth="1.25"
          markerEnd="url(#arrow)"
        />
        <path
          d="M322 236 C300 186 316 130 348 98"
          fill="none"
          stroke="#cecac8"
          strokeWidth="1.25"
          markerEnd="url(#arrow)"
        />

        <EdgeLabel x={228} y={58} text="deposits USDC" />
        <EdgeLabel x={498} y={58} text="draws USDC" />
        <EdgeLabel x={498} y={90} text="one-time fee" />
        <EdgeLabel x={230} y={130} text="liquidation gains" />
        <EdgeLabel x={230} y={144} text="and protocol rewards" />
        <EdgeLabel x={608} y={196} text="locks collateral" anchor="start" />
        <EdgeLabel x={296} y={172} text="secures the debt" anchor="end" />

        <Node x={12} y={48} w={170} label="Liquidity provider" />
        <Node x={280} y={48} w={160} label="Stability pool" accent />
        <Node x={556} y={48} w={140} label="Borrower" />
        <Node x={268} y={240} w={184} label="Collateral vault" />

        <EdgeLabel x={360} y={312} text="unlocked when the drawn amount is repaid" />
      </svg>
      <figcaption className="mt-4 text-center text-[12px] tracking-[-0.02em] text-smoke">
        USDC moves through the pool for fixed one-time fees, never for interest. Collateral stays
        locked until repayment.
      </figcaption>
    </figure>
  )
}
