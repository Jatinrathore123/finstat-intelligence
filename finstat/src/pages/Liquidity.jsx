import { useStore } from '../store/useStore'
import { EmptyState, RatioRow, SectionHeader, formatNumber } from '../components/UI'
import { liquidityRatios } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Liquidity() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const r = liquidityRatios(data, year)

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="Liquidity Ratios" description="Short-term ability to meet obligations as they come due." />
      <table className="w-full ledger-card dir-flat">
        <tbody>
          <RatioRow label="Current Ratio" value={r.currentRatio} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Current Assets / Current Liabilities" interpretation="Above 1x means current assets exceed current liabilities. Very high ratios can indicate idle assets." />
          <RatioRow label="Quick Ratio" value={r.quickRatio} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="(Current Assets − Inventory) / Current Liabilities" interpretation="A stricter test that excludes inventory, which may not be quickly convertible to cash." />
          <RatioRow label="Cash Ratio" value={r.cashRatio} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Cash & Equivalents / Current Liabilities" interpretation="The most conservative liquidity measure." />
          <RatioRow label="Working Capital" value={r.workingCapital} formula="Current Assets − Current Liabilities" />
          <RatioRow label="Working Capital / Revenue" value={r.workingCapitalToRevenue} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="Working Capital / Revenue" interpretation="How much working capital is tied up relative to the scale of the business." />
        </tbody>
      </table>
    </div>
  )
}
