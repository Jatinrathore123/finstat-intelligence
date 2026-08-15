import { useState } from 'react'
import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { getValue } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Scenario() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  const [revGrowthAssumption, setRevGrowthAssumption] = useState(10)
  const [ebitdaMarginAssumption, setEbitdaMarginAssumption] = useState(20)
  const [interestRateAssumption, setInterestRateAssumption] = useState(9)

  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  const year = data.years[data.years.length - 1]
  const baseRevenue = getValue(data, 'revenue', year)
  const baseDebt = getValue(data, 'total_debt', year)
  const baseDepreciation = getValue(data, 'depreciation', year) || 0
  const baseTaxRate = (() => {
    const pbt = getValue(data, 'pbt', year)
    const tax = getValue(data, 'tax_expense', year)
    return pbt ? tax / pbt : 0.25
  })()

  let projected = null
  if (baseRevenue != null) {
    const projRevenue = baseRevenue * (1 + revGrowthAssumption / 100)
    const projEbitda = projRevenue * (ebitdaMarginAssumption / 100)
    const projEbit = projEbitda - baseDepreciation
    const projFinanceCost = baseDebt != null ? baseDebt * (interestRateAssumption / 100) : 0
    const projPbt = projEbit - projFinanceCost
    const projPat = projPbt * (1 - baseTaxRate)
    projected = { projRevenue, projEbitda, projEbit, projFinanceCost, projPbt, projPat }
  }

  return (
    <div>
      <SectionHeader
        eyebrow={`Base period: ${year}`}
        title="Scenario Analysis"
        description="Explore hypothetical outcomes by adjusting assumptions. These are scenarios, not forecasts — the model is a simplified projection off the latest reported year."
      />

      {baseRevenue == null ? (
        <div className="text-sm text-ink/50">Revenue is required for this period to run a scenario.</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Slider label="Revenue Growth" value={revGrowthAssumption} min={-10} max={30} onChange={setRevGrowthAssumption} suffix="%" />
            <Slider label="EBITDA Margin" value={ebitdaMarginAssumption} min={5} max={35} onChange={setEbitdaMarginAssumption} suffix="%" />
            <Slider label="Interest Rate on Debt" value={interestRateAssumption} min={5} max={15} onChange={setInterestRateAssumption} suffix="%" />
          </div>

          <table className="w-full ledger-card dir-flat">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
                <th className="py-2">Metric</th>
                <th className="py-2 text-right">Projected</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Revenue" value={projected.projRevenue} />
              <Row label="EBITDA" value={projected.projEbitda} />
              <Row label="EBIT" value={projected.projEbit} />
              <Row label="Finance Cost" value={projected.projFinanceCost} />
              <Row label="PBT" value={projected.projPbt} />
              <Row label="PAT" value={projected.projPat} />
            </tbody>
          </table>
          <p className="text-xs text-ink/50 mt-3">
            Assumes depreciation and effective tax rate hold at {year} levels, and finance cost scales with {year} total debt at the assumed interest rate. This is a simplified sensitivity tool, not a full financial model.
          </p>
        </>
      )}
    </div>
  )
}

function Slider({ label, value, min, max, onChange, suffix }) {
  return (
    <div>
      <div className="text-sm mb-1">{label}: <span className="num">{value}{suffix}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-2 text-sm">{label}</td>
      <td className="py-2 text-right num text-sm">{formatNumber(value)}</td>
    </tr>
  )
}
