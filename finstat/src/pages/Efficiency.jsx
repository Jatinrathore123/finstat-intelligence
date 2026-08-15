import { useStore } from '../store/useStore'
import { EmptyState, RatioRow, SectionHeader, formatNumber } from '../components/UI'
import { efficiencyRatios } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Efficiency() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const r = efficiencyRatios(data, year)
  const days = v => formatNumber(v, { decimals: 0, suffix: ' days' })
  const x = v => formatNumber(v, { decimals: 2, suffix: 'x' })

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="Efficiency / Activity Ratios" description="How effectively the company uses its assets and manages working capital." />
      <table className="w-full ledger-card dir-flat">
        <tbody>
          <RatioRow label="Asset Turnover" value={r.assetTurnover} format={x} formula="Revenue / Average Total Assets" />
          <RatioRow label="Inventory Turnover" value={r.inventoryTurnover} format={x} formula="COGS / Average Inventory" />
          <RatioRow label="Receivables Turnover" value={r.receivablesTurnover} format={x} formula="Revenue / Average Trade Receivables" />
          <RatioRow label="Payables Turnover" value={r.payablesTurnover} format={x} formula="COGS / Average Trade Payables" />
          <RatioRow label="Inventory Days" value={r.inventoryDays} format={days} formula="Average Inventory / COGS × days in year" />
          <RatioRow label="Receivable Days" value={r.receivableDays} format={days} formula="Average Trade Receivables / Revenue × days in year" />
          <RatioRow label="Payable Days" value={r.payableDays} format={days} formula="Average Trade Payables / COGS × days in year" />
          <RatioRow label="Cash Conversion Cycle" value={r.cashConversionCycle} format={days} formula="Inventory Days + Receivable Days − Payable Days" interpretation="Shorter is generally better — fewer days of cash tied up in operations." />
        </tbody>
      </table>
    </div>
  )
}
