import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { dupont } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function DuPont() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const prevYear = data.years.length > 1 ? data.years[data.years.length - 2] : null
  const d = dupont(data, year)
  const dPrev = prevYear ? dupont(data, prevYear) : null

  let driverNote = null
  if (dPrev && d.roe != null && dPrev.roe != null) {
    const marginDelta = (d.netMargin ?? 0) - (dPrev.netMargin ?? 0)
    const turnoverDelta = (d.assetTurnover ?? 0) - (dPrev.assetTurnover ?? 0)
    const leverageDelta = (d.equityMultiplier ?? 0) - (dPrev.equityMultiplier ?? 0)
    const drivers = [
      { name: 'stronger net margins', magnitude: Math.abs(marginDelta) / (dPrev.netMargin || 1) },
      { name: 'more efficient asset use', magnitude: Math.abs(turnoverDelta) / (dPrev.assetTurnover || 1) },
      { name: 'higher financial leverage', magnitude: Math.abs(leverageDelta) / (dPrev.equityMultiplier || 1) },
    ].sort((a, b) => b.magnitude - a.magnitude)
    const direction = d.roe > dPrev.roe ? 'improved' : 'declined'
    driverNote = `ROE ${direction} from ${formatNumber(dPrev.roe, { suffix: '%' })} to ${formatNumber(d.roe, { suffix: '%' })}, primarily driven by ${drivers[0].name} rather than the other two components.`
  }

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="DuPont Analysis" description="Decomposes ROE into profitability, asset efficiency, and financial leverage." />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Component label="Net Profit Margin" value={d.netMargin} suffix="%" formula="PAT / Revenue" />
        <Component label="Asset Turnover" value={d.assetTurnover} suffix="x" decimals={2} formula="Revenue / Avg. Total Assets" />
        <Component label="Equity Multiplier" value={d.equityMultiplier} suffix="x" decimals={2} formula="Avg. Total Assets / Avg. Equity" />
      </div>

      <div className="ledger-card dir-flat text-center mb-6">
        <div className="text-[11px] uppercase tracking-wide text-ink/50">Return on Equity (ROE)</div>
        <div className="num text-3xl mt-1">{d.roe == null ? '—' : formatNumber(d.roe, { suffix: '%' })}</div>
        <div className="text-xs text-ink/40 mt-1">= Net Margin × Asset Turnover × Equity Multiplier</div>
      </div>

      {driverNote && (
        <div className="ledger-card dir-flat text-sm">
          <div className="text-[11px] uppercase tracking-wide text-ink/40 mb-1">What's driving the change</div>
          {driverNote}
        </div>
      )}
    </div>
  )
}

function Component({ label, value, suffix, decimals = 1, formula }) {
  return (
    <div className="ledger-card dir-flat text-center">
      <div className="text-[11px] uppercase tracking-wide text-ink/50">{label}</div>
      <div className="num text-2xl mt-1">{value == null ? '—' : formatNumber(value, { decimals, suffix })}</div>
      <div className="text-[11px] text-ink/40 mt-1 num">{formula}</div>
    </div>
  )
}
