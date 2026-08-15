import { useStore } from '../store/useStore'
import { EmptyState, RatioRow, SectionHeader, formatNumber } from '../components/UI'
import { cashFlowMetrics } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function CashFlow() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const r = cashFlowMetrics(data, year)

  let quality = null
  if (r.cfoToPat != null) {
    if (r.cfoToPat >= 1.1) quality = { tone: 'text-ledger', text: 'Operating cash flow substantially exceeds reported PAT, indicating strong cash conversion.' }
    else if (r.cfoToPat < 0.7) quality = { tone: 'text-amber', text: 'PAT has not translated into proportional operating cash flow. This may warrant investigation of receivables, inventory, working capital, or non-cash income — it does not automatically indicate a problem.' }
    else quality = { tone: 'text-ink/60', text: 'Operating cash flow is broadly in line with reported PAT.' }
  }

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="Cash Flow Analysis" description="Cash generation, investment, and financing activity, and how it compares with reported profit." />
      <table className="w-full ledger-card dir-flat mb-6">
        <tbody>
          <RatioRow label="Operating Cash Flow (CFO)" value={r.cfo} />
          <RatioRow label="Investing Cash Flow (CFI)" value={r.cfi} />
          <RatioRow label="Financing Cash Flow (CFF)" value={r.cff} />
          <RatioRow label="Free Cash Flow (FCF)" value={r.fcf} formula="CFO − Capital Expenditure" />
          <RatioRow label="CFO / PAT" value={r.cfoToPat} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} formula="CFO / PAT" interpretation="A rough earnings-quality signal: values well below 1x can indicate profit that hasn't yet converted to cash." />
          <RatioRow label="CFO / Revenue" value={r.cfoToRevenue} format={v => formatNumber(v, { suffix: '%' })} formula="CFO / Revenue × 100" />
          <RatioRow label="Capex / Revenue" value={r.capexToRevenue} format={v => formatNumber(v, { suffix: '%' })} formula="Capex / Revenue × 100" />
        </tbody>
      </table>

      {quality && (
        <div className={`ledger-card dir-flat text-sm ${quality.tone}`}>
          <div className="text-[11px] uppercase tracking-wide text-ink/40 mb-1">Earnings Quality — CFO vs PAT</div>
          {quality.text}
        </div>
      )}
    </div>
  )
}
