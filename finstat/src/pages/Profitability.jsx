import { useStore } from '../store/useStore'
import { EmptyState, RatioRow, SectionHeader, formatNumber } from '../components/UI'
import { profitabilityRatios } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Profitability() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const r = profitabilityRatios(data, year)
  const pct = v => formatNumber(v, { suffix: '%' })

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="Profitability Ratios" description="Margins and returns — how efficiently the company converts revenue and capital into profit." />
      <table className="w-full ledger-card dir-flat">
        <tbody>
          <RatioRow label="Gross Profit Margin" value={r.grossProfitMargin} format={pct} formula="Gross Profit / Revenue × 100" interpretation="Higher is generally better; reflects core product/service economics before overheads." />
          <RatioRow label="EBITDA Margin" value={r.ebitdaMargin} format={pct} formula="EBITDA / Revenue × 100" interpretation="Operating profitability before financing and non-cash charges." />
          <RatioRow label="EBIT Margin" value={r.ebitMargin} format={pct} formula="EBIT / Revenue × 100" interpretation="Operating profitability after depreciation." />
          <RatioRow label="PBT Margin" value={r.pbtMargin} format={pct} formula="PBT / Revenue × 100" />
          <RatioRow label="Net Profit Margin" value={r.netProfitMargin} format={pct} formula="PAT / Revenue × 100" interpretation="Bottom-line profitability after all costs, interest, and tax." />
          <RatioRow label="Return on Assets (ROA)" value={r.roa} format={pct} formula="PAT / Average Total Assets × 100" interpretation="How efficiently assets generate profit." />
          <RatioRow label="Return on Equity (ROE)" value={r.roe} format={pct} formula="PAT / Average Shareholders' Equity × 100" interpretation="Return generated on shareholders' capital. See DuPont for a breakdown of drivers." />
          <RatioRow label="Return on Capital Employed (ROCE)" value={r.roce} format={pct} formula="EBIT / Average Capital Employed × 100" definition="Capital Employed = Average Equity + Average Total Debt (one common definition — methodologies vary)." interpretation="Return generated on the total capital invested in the business, independent of capital structure." />
        </tbody>
      </table>
    </div>
  )
}
