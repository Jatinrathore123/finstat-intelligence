import { useStore } from '../store/useStore'
import { EmptyState, RatioRow, SectionHeader, formatNumber } from '../components/UI'
import { solvencyRatios } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Solvency() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const r = solvencyRatios(data, year)

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="Solvency & Leverage Ratios" description="Long-term financial risk and the company's reliance on debt." />
      {r.ebitdaIsNonPositive && (
        <div className="text-sm text-amber bg-amber/5 border border-amber/30 rounded-sm p-3 mb-4">
          ⚠ EBITDA is zero or negative this period — Net Debt/EBITDA is not meaningful and is shown as "—".
        </div>
      )}
      <table className="w-full ledger-card dir-flat">
        <tbody>
          <RatioRow label="Debt-to-Equity" value={r.debtToEquity} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Total Debt / Equity" interpretation="Higher values indicate greater reliance on borrowed capital relative to shareholders' funds." />
          <RatioRow label="Debt Ratio" value={r.debtRatio} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Total Debt / Total Assets" />
          <RatioRow label="Equity Ratio" value={r.equityRatio} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Equity / Total Assets" />
          <RatioRow label="Interest Coverage Ratio" value={r.interestCoverage} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="EBIT / Finance Cost" interpretation="How comfortably operating earnings cover interest obligations. Below ~2x is often considered risky." />
          <RatioRow label="Net Debt" value={r.netDebt} formula="Total Debt − Cash & Cash Equivalents" />
          <RatioRow label="Net Debt / EBITDA" value={r.ebitdaIsNonPositive ? null : r.netDebtToEbitda} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Net Debt / EBITDA" interpretation="A common lender metric for how many years of EBITDA it would take to repay net debt." />
        </tbody>
      </table>
    </div>
  )
}
