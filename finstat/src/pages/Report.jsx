import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { useNavigate } from 'react-router-dom'
import {
  liquidityRatios, profitabilityRatios, solvencyRatios, efficiencyRatios,
  cashFlowMetrics, dupont, financialHealthScore, prevYearOf,
} from '../lib/calculations'
import { analyzeSignals } from '../lib/redFlags'
import { TAXONOMY_MAP } from '../lib/taxonomy'

export default function Report() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const prevYear = prevYearOf(data, year)
  const liq = liquidityRatios(data, year)
  const prof = profitabilityRatios(data, year)
  const solv = solvencyRatios(data, year)
  const eff = efficiencyRatios(data, year)
  const cf = cashFlowMetrics(data, year)
  const du = dupont(data, year)
  const health = financialHealthScore(data, year)
  const signals = prevYear ? analyzeSignals(data, year) : { redFlags: [], positives: [] }

  function exportCSV() {
    const rows = [['Line Item', ...data.years]]
    Object.entries(data.items).forEach(([key, byYear]) => {
      const label = TAXONOMY_MAP[key]?.label || key
      rows.push([label, ...data.years.map(y => byYear[y] ?? '')])
    })
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.meta.companyName || 'financial-data').replace(/\s+/g, '-')}-normalized.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <SectionHeader title="Financial Analysis Report" description="Printable report and raw data export." />
      </div>

      <div className="flex gap-3 mb-8 no-print">
        <button onClick={() => window.print()} className="bg-navy text-white px-4 py-2 rounded-sm text-sm">
          Print / Save as PDF
        </button>
        <button onClick={exportCSV} className="border border-line px-4 py-2 rounded-sm text-sm">
          Export normalized data (CSV)
        </button>
      </div>

      {/* Printable report body */}
      <div className="bg-white border border-line rounded-sm p-8 space-y-8">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-ledger">Financial Analysis Report</div>
          <h1 className="font-display text-3xl mt-1">{data.meta.companyName || 'Company'}</h1>
          <div className="text-sm text-ink/60 mt-1">
            {data.meta.consolidated} · {data.meta.currency} {data.meta.unit} · Period: {year}{prevYear ? ` (vs ${prevYear})` : ''}
          </div>
        </div>

        <ReportSection title="1. Executive Summary">
          <p className="text-sm leading-relaxed">
            Financial Health Score: <strong className="num">{health.overall ?? '—'}/100</strong>.
            Revenue for {year}: <strong className="num">{formatNumber(data.items.revenue?.[year])}</strong>,
            PAT: <strong className="num">{formatNumber(data.items.pat?.[year])}</strong>,
            Net Profit Margin: <strong className="num">{formatNumber(prof.netProfitMargin, { suffix: '%' })}</strong>,
            ROE: <strong className="num">{formatNumber(prof.roe, { suffix: '%' })}</strong>.
            This score is an analytical indicator only and not investment advice.
          </p>
        </ReportSection>

        <ReportSection title="2. Profitability">
          <MiniTable rows={[
            ['Gross Profit Margin', formatNumber(prof.grossProfitMargin, { suffix: '%' })],
            ['EBITDA Margin', formatNumber(prof.ebitdaMargin, { suffix: '%' })],
            ['Net Profit Margin', formatNumber(prof.netProfitMargin, { suffix: '%' })],
            ['ROA', formatNumber(prof.roa, { suffix: '%' })],
            ['ROE', formatNumber(prof.roe, { suffix: '%' })],
            ['ROCE', formatNumber(prof.roce, { suffix: '%' })],
          ]} />
        </ReportSection>

        <ReportSection title="3. Liquidity">
          <MiniTable rows={[
            ['Current Ratio', formatNumber(liq.currentRatio, { decimals: 2, suffix: 'x' })],
            ['Quick Ratio', formatNumber(liq.quickRatio, { decimals: 2, suffix: 'x' })],
            ['Working Capital', formatNumber(liq.workingCapital)],
          ]} />
        </ReportSection>

        <ReportSection title="4. Solvency">
          <MiniTable rows={[
            ['Debt-to-Equity', formatNumber(solv.debtToEquity, { decimals: 2, suffix: 'x' })],
            ['Interest Coverage', formatNumber(solv.interestCoverage, { decimals: 2, suffix: 'x' })],
            ['Net Debt', formatNumber(solv.netDebt)],
          ]} />
        </ReportSection>

        <ReportSection title="5. Efficiency">
          <MiniTable rows={[
            ['Asset Turnover', formatNumber(eff.assetTurnover, { decimals: 2, suffix: 'x' })],
            ['Cash Conversion Cycle', formatNumber(eff.cashConversionCycle, { decimals: 0, suffix: ' days' })],
          ]} />
        </ReportSection>

        <ReportSection title="6. Cash Flow">
          <MiniTable rows={[
            ['Operating Cash Flow', formatNumber(cf.cfo)],
            ['Free Cash Flow', formatNumber(cf.fcf)],
            ['CFO / PAT', formatNumber(cf.cfoToPat, { decimals: 2, suffix: 'x' })],
          ]} />
        </ReportSection>

        <ReportSection title="7. DuPont Analysis">
          <MiniTable rows={[
            ['Net Profit Margin', formatNumber(du.netMargin, { suffix: '%' })],
            ['Asset Turnover', formatNumber(du.assetTurnover, { decimals: 2, suffix: 'x' })],
            ['Equity Multiplier', formatNumber(du.equityMultiplier, { decimals: 2, suffix: 'x' })],
            ['ROE', formatNumber(du.roe, { suffix: '%' })],
          ]} />
        </ReportSection>

        <ReportSection title="8. Red Flags">
          {signals.redFlags.length === 0 ? <p className="text-sm text-ink/50">None detected.</p> : (
            <ul className="text-sm space-y-1 list-disc pl-5">
              {signals.redFlags.map(f => <li key={f.id}>{f.title} — {f.severity}</li>)}
            </ul>
          )}
        </ReportSection>

        <ReportSection title="9. Positive Signals">
          {signals.positives.length === 0 ? <p className="text-sm text-ink/50">None detected.</p> : (
            <ul className="text-sm space-y-1 list-disc pl-5">
              {signals.positives.map((p, i) => <li key={i}>{p.title}</li>)}
            </ul>
          )}
        </ReportSection>

        <ReportSection title="10. Methodology & Data Quality">
          <p className="text-sm leading-relaxed text-ink/70">
            Ratios are calculated using standard formulas shown under "How is this calculated?"
            on each analysis page. Figures reflect the values confirmed on the Review Data screen,
            which may include user corrections to auto-extracted data. Averages (e.g. for ROE, ROA)
            use the average of the current and prior year balance where a prior year is available.
            This report is generated automatically from the data provided and has not been
            independently audited.
          </p>
        </ReportSection>
      </div>
    </div>
  )
}

function ReportSection({ title, children }) {
  return (
    <div className="break-inside-avoid">
      <div className="font-display text-lg border-b border-line pb-2 mb-3">{title}</div>
      {children}
    </div>
  )
}

function MiniTable({ rows }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-line last:border-0">
            <td className="py-1.5">{label}</td>
            <td className="py-1.5 text-right num">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
