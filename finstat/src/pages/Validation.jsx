import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { balanceSheetCheck, getValue } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Validation() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  return (
    <div>
      <SectionHeader title="Data Validation" description="Automatic accounting consistency checks. Failures don't block analysis, but should be resolved for reliable results." />

      <div className="font-display text-lg mb-3">Balance Sheet: Assets = Equity + Liabilities</div>
      <table className="w-full ledger-card dir-flat mb-8">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
            <th className="py-2">Year</th>
            <th className="py-2 text-right">Total Assets</th>
            <th className="py-2 text-right">Equity + Liabilities</th>
            <th className="py-2 text-right">Difference</th>
            <th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.years.map(y => {
            const c = balanceSheetCheck(data, y)
            return (
              <tr key={y} className="border-b border-line last:border-0">
                <td className="py-2 text-sm">{y}</td>
                <td className="py-2 text-right num text-sm">{c.checkable ? formatNumber(c.totalAssets) : '—'}</td>
                <td className="py-2 text-right num text-sm">{c.checkable ? formatNumber(c.equityPlusLiabilities) : '—'}</td>
                <td className="py-2 text-right num text-sm">{c.checkable ? formatNumber(c.difference) : '—'}</td>
                <td className="py-2 text-right text-sm">
                  {!c.checkable ? <span className="text-ink/40">Insufficient data</span> : c.balances ? <span className="text-ledger">✓ Balances</span> : <span className="text-rose">⚠ Mismatch</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="font-display text-lg mb-3">Cash Flow Reconciliation</div>
      <table className="w-full ledger-card dir-flat">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
            <th className="py-2">Year</th>
            <th className="py-2 text-right">Opening + CFO + CFI + CFF</th>
            <th className="py-2 text-right">Closing Cash (reported)</th>
            <th className="py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.years.map(y => {
            const opening = getValue(data, 'opening_cash', y)
            const cfo = getValue(data, 'cfo', y)
            const cfi = getValue(data, 'cfi', y)
            const cff = getValue(data, 'cff', y)
            const closing = getValue(data, 'closing_cash', y)
            const checkable = [opening, cfo, cfi, cff, closing].every(v => v != null)
            const computed = checkable ? opening + cfo + cfi + cff : null
            const diff = checkable ? computed - closing : null
            const tolerance = checkable ? Math.abs(closing) * 0.01 : null
            const ok = checkable && Math.abs(diff) <= tolerance
            return (
              <tr key={y} className="border-b border-line last:border-0">
                <td className="py-2 text-sm">{y}</td>
                <td className="py-2 text-right num text-sm">{checkable ? formatNumber(computed) : '—'}</td>
                <td className="py-2 text-right num text-sm">{checkable ? formatNumber(closing) : '—'}</td>
                <td className="py-2 text-right text-sm">
                  {!checkable ? <span className="text-ink/40">Opening/closing cash not entered</span> : ok ? <span className="text-ledger">✓ Reconciles</span> : <span className="text-rose">⚠ Mismatch</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-ink/50 mt-3">
        Cash flow reconciliation requires Opening and Closing Cash Balance line items, which aren't
        always disclosed as separate rows — add them on the Review Data screen if available.
      </p>
    </div>
  )
}
