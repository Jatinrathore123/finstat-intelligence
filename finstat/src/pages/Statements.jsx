import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { TAXONOMY } from '../lib/taxonomy'

const GROUPS = [
  { key: 'pnl', label: 'Statement of Profit & Loss' },
  { key: 'bs_asset', label: 'Balance Sheet — Assets' },
  { key: 'bs_equity', label: 'Balance Sheet — Equity' },
  { key: 'bs_liability', label: 'Balance Sheet — Liabilities' },
  { key: 'cf', label: 'Cash Flow Statement' },
]

export default function Statements() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  return (
    <div>
      <SectionHeader
        title="Financial Statements"
        description={`Normalized figures as confirmed on Review Data. ${data.meta.currency} ${data.meta.unit}.`}
      />
      <button onClick={() => navigate('/review')} className="text-ledger underline decoration-dotted text-sm mb-6 inline-block">
        Edit in Review Data →
      </button>

      {GROUPS.map(g => {
        const rows = TAXONOMY.filter(t => t.statement === g.key && data.items[t.key])
        if (rows.length === 0) return null
        return (
          <div key={g.key} className="mb-8">
            <div className="font-display text-lg mb-3">{g.label}</div>
            <table className="w-full ledger-card dir-flat">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
                  <th className="py-2">Line item</th>
                  {data.years.map(y => <th key={y} className="py-2 text-right">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(t => (
                  <tr key={t.key} className="border-b border-line last:border-0">
                    <td className="py-2 text-sm">{t.label}</td>
                    {data.years.map(y => (
                      <td key={y} className="py-2 text-right num text-sm">{formatNumber(data.items[t.key]?.[y])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
