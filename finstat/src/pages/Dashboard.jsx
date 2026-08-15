import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { EmptyState, KpiCard, SectionHeader, formatNumber } from '../components/UI'
import {
  liquidityRatios, profitabilityRatios, solvencyRatios, cashFlowMetrics,
  yoyGrowth, financialHealthScore, prevYearOf, getValue,
} from '../lib/calculations'

export default function Dashboard() {
  const navigate = useNavigate()
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)

  if (!hasData || data.years.length === 0) {
    return (
      <EmptyState
        title="No financial data yet"
        detail="Upload a statement or enter figures manually to see the executive dashboard, ratios, trends, and red-flag screening — auto-updated to whichever financial year is most recent."
        action={
          <button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">
            Upload financial statements
          </button>
        }
      />
    )
  }

  // Always analyzes the LATEST year present in the data — this is what makes
  // the dashboard "dynamic": add a new year's column later and it re-centers here.
  const year = data.years[data.years.length - 1]
  const prevYear = prevYearOf(data, year)

  const liq = liquidityRatios(data, year)
  const prof = profitabilityRatios(data, year)
  const solv = solvencyRatios(data, year)
  const cf = cashFlowMetrics(data, year)
  const health = financialHealthScore(data, year)

  const revenue = getValue(data, 'revenue', year)
  const revenuePrev = getValue(data, 'revenue', prevYear)
  const revGrowth = yoyGrowth(data, 'revenue', year)
  const pat = getValue(data, 'pat', year)
  const patPrev = getValue(data, 'pat', prevYear)

  return (
    <div>
      <SectionHeader
        eyebrow={`Latest reported period: ${year}${prevYear ? ` · vs ${prevYear}` : ''}`}
        title={data.meta.companyName || 'Company overview'}
        description={`${data.meta.consolidated} · ${data.meta.currency} ${data.meta.unit} · ${data.years.length} year(s) analyzed`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Revenue" value={revenue} prevValue={revenuePrev} />
        <KpiCard label="Revenue Growth" value={revGrowth} prevValue={null} format={v => formatNumber(v, { suffix: '%' })} />
        <KpiCard label="EBITDA Margin" value={prof.ebitdaMargin} format={v => formatNumber(v, { suffix: '%' })} />
        <KpiCard label="PAT Margin" value={prof.netProfitMargin} format={v => formatNumber(v, { suffix: '%' })} />
        <KpiCard label="ROE" value={prof.roe} format={v => formatNumber(v, { suffix: '%' })} />
        <KpiCard label="ROCE" value={prof.roce} format={v => formatNumber(v, { suffix: '%' })} />
        <KpiCard label="Debt / Equity" value={solv.debtToEquity} format={v => formatNumber(v, { decimals: 2 })} />
        <KpiCard label="Current Ratio" value={liq.currentRatio} format={v => formatNumber(v, { decimals: 2 })} />
        <KpiCard label="Operating Cash Flow" value={cf.cfo} />
        <KpiCard label="Free Cash Flow" value={cf.fcf} />
        <KpiCard label="Interest Coverage" value={solv.interestCoverage} format={v => formatNumber(v, { decimals: 2, suffix: 'x' })} />
        <KpiCard label="PAT" value={pat} prevValue={patPrev} />
      </div>

      <div className="ledger-card dir-flat mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg">Financial Health Score</div>
          <div className="num text-3xl">{health.overall ?? '—'}<span className="text-sm text-ink/40">/100</span></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(health.pillars).map(([k, v]) => (
            <div key={k} className="text-sm">
              <div className="text-ink/50 capitalize text-xs">{k.replace(/([A-Z])/g, ' $1')}</div>
              <div className="num text-lg">{v == null ? '—' : Math.round(v)}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/50 mt-4 leading-relaxed">
          This score is an analytical indicator derived solely from the financial figures
          provided, using transparent, editable thresholds. It is not investment advice and
          does not account for qualitative factors, industry context, or macroeconomic conditions.
        </p>
      </div>

      <div className="text-sm text-ink/60">
        See <button className="text-ledger underline decoration-dotted" onClick={() => navigate('/red-flags')}>Red Flags</button> for
        automated screening, or <button className="text-ledger underline decoration-dotted" onClick={() => navigate('/ai-analyst')}>AI Analyst</button> for
        a narrative explanation of what changed and why.
      </div>
    </div>
  )
}
