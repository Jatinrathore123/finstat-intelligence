import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { yoyGrowth, cagrForKey } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

const METRICS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'ebitda', label: 'EBITDA' },
  { key: 'ebit', label: 'EBIT' },
  { key: 'pat', label: 'PAT' },
  { key: 'eps', label: 'EPS' },
  { key: 'total_assets', label: 'Total Assets' },
  { key: 'total_equity', label: 'Equity' },
  { key: 'total_debt', label: 'Debt' },
  { key: 'cfo', label: 'CFO' },
]

export default function Growth() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const n = data.years.length - 1
  const pct = v => formatNumber(v, { suffix: '%' })

  return (
    <div>
      <SectionHeader
        eyebrow={`Latest period: ${year}`}
        title="Growth Analysis"
        description={n > 0 ? `Year-on-year growth into ${year}, and CAGR across all ${data.years.length} years of data (${data.years[0]}–${year}).` : 'Add more than one year of data to see growth rates.'}
      />
      <table className="w-full ledger-card dir-flat">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
            <th className="py-2">Metric</th>
            <th className="py-2 text-right">YoY Growth</th>
            <th className="py-2 text-right">{n > 1 ? `CAGR (${data.years[0]}–${year})` : ''}</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map(m => {
            const yoy = yoyGrowth(data, m.key, year)
            const c = n > 1 ? cagrForKey(data, m.key) : null
            return (
              <tr key={m.key} className="border-b border-line last:border-0">
                <td className="py-3 text-sm">{m.label}</td>
                <td className="py-3 text-right num text-sm">{yoy == null ? '—' : pct(yoy)}</td>
                <td className="py-3 text-right num text-sm">{n <= 1 ? '' : (c == null ? 'n/a (non-positive value)' : pct(c))}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-ink/50 mt-3">
        CAGR is mathematically undefined when the beginning or ending value is zero or negative — shown as "n/a" in those cases rather than a misleading number.
      </p>
    </div>
  )
}
