import { useState } from 'react'

export function formatNumber(n, { decimals = 1, suffix = '' } = {}) {
  if (n == null || Number.isNaN(n)) return '—'
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + suffix
}

export function KpiCard({ label, value, prevValue, format = (v) => formatNumber(v), interpretation }) {
  const hasComparison = prevValue != null && value != null
  const delta = hasComparison ? value - prevValue : null
  const dir = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'

  return (
    <div className={`ledger-card dir-${dir}`}>
      <div className="text-[11px] uppercase tracking-wide text-ink/50 pl-2">{label}</div>
      <div className="flex items-baseline gap-2 pl-2 mt-1">
        <span className="num text-2xl font-medium">{value == null ? '—' : format(value)}</span>
        {hasComparison && (
          <span className={`num text-xs ${dir === 'up' ? 'text-ledger' : dir === 'down' ? 'text-rose' : 'text-ink/40'}`}>
            {arrow} {formatNumber(Math.abs(delta))}
          </span>
        )}
      </div>
      {interpretation && <div className="text-xs text-ink/60 pl-2 mt-2 leading-snug">{interpretation}</div>}
    </div>
  )
}

export function EmptyState({ title, detail, action }) {
  return (
    <div className="border border-dashed border-line rounded-sm p-10 text-center bg-white/50">
      <div className="font-display text-lg">{title}</div>
      {detail && <div className="text-sm text-ink/60 mt-2 max-w-md mx-auto">{detail}</div>}
      {action}
    </div>
  )
}

export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && <div className="text-[11px] uppercase tracking-widest text-ledger mb-1">{eyebrow}</div>}
      <h1 className="font-display text-2xl">{title}</h1>
      {description && <p className="text-sm text-ink/60 mt-1 max-w-2xl">{description}</p>}
    </div>
  )
}

export function MethodologyNote({ formula, definition, interpretation }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-[11px] text-ink/40 hover:text-ledger underline decoration-dotted"
      >
        {open ? 'Hide' : 'How is this calculated?'}
      </button>
      {open && (
        <div className="text-xs text-ink/70 mt-2 bg-paper border border-line rounded-sm p-3 space-y-1">
          {formula && <div><span className="text-ink/40">Formula: </span><span className="num">{formula}</span></div>}
          {definition && <div><span className="text-ink/40">Definition: </span>{definition}</div>}
          {interpretation && <div><span className="text-ink/40">Interpretation: </span>{interpretation}</div>}
        </div>
      )}
    </div>
  )
}

export function RatioRow({ label, value, format = (v) => formatNumber(v), formula, definition, interpretation }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-3 pr-4 align-top">
        <div className="text-sm">{label}</div>
        <MethodologyNote formula={formula} definition={definition} interpretation={interpretation} />
      </td>
      <td className="py-3 text-right num text-sm align-top whitespace-nowrap">{value == null ? '—' : format(value)}</td>
    </tr>
  )
}
