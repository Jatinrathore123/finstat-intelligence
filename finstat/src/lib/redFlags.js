import { getValue as get, prevYearOf } from './calculations'
import { profitabilityRatios, solvencyRatios, cashFlowMetrics, yoyGrowth, dupont } from './calculations'

const SEVERITY = { LOW: '🟢 Low', MODERATE: '🟡 Moderate', HIGH: '🟠 High', CRITICAL: '🔴 Critical' }

function flag(id, title, severity, metric, current, comparison, why, investigate) {
  return { id, title, severity, metric, current, comparison, why, investigate }
}

// Returns { redFlags: [...], positiveSignals: [...] } for the given (latest) year.
export function analyzeSignals(data, year) {
  const prevYear = prevYearOf(data, year)
  const redFlags = []
  const positives = []
  if (!prevYear) return { redFlags, positives, note: 'Need at least two years of data for trend-based signal detection.' }

  const cf = cashFlowMetrics(data, year)
  const pat = get(data, 'pat', year)
  const patGrowth = yoyGrowth(data, 'pat', year)
  const cfoGrowth = yoyGrowth(data, 'cfo', year)
  const revGrowth = yoyGrowth(data, 'revenue', year)
  const recGrowth = yoyGrowth(data, 'trade_receivables', year)
  const invGrowth = yoyGrowth(data, 'inventories', year)
  const debtGrowth = yoyGrowth(data, 'total_debt', year)
  const prof = profitabilityRatios(data, year)
  const profPrev = profitabilityRatios(data, prevYear)
  const solv = solvencyRatios(data, year)
  const solvPrev = solvencyRatios(data, prevYear)
  const otherIncome = get(data, 'other_income', year)
  const otherIncomePrev = get(data, 'other_income', prevYear)
  const otherIncomeGrowth = yoyGrowth(data, 'other_income', year)

  // 1. PAT rising while CFO declines
  if (patGrowth != null && cfoGrowth != null && patGrowth > 5 && cfoGrowth < 0) {
    redFlags.push(flag(
      'pat_cfo_divergence', 'Profit rising while operating cash flow declines', SEVERITY.HIGH,
      'PAT growth vs CFO growth', `PAT ${patGrowth.toFixed(1)}%, CFO ${cfoGrowth.toFixed(1)}%`, `Prior year`,
      'Rising reported profit without matching cash generation can signal aggressive revenue recognition, rising receivables, or non-cash income.',
      'Check receivables growth, inventory build-up, and the composition of "other income" for the period.'
    ))
  } else if (cf.cfoToPat != null && cf.cfoToPat > 1.2) {
    positives.push({ title: 'Strong cash conversion', detail: `Operating cash flow is ${cf.cfoToPat.toFixed(2)}x reported PAT, indicating high-quality earnings backed by cash.` })
  }

  // 2. Receivables growing faster than revenue
  if (recGrowth != null && revGrowth != null && recGrowth - revGrowth > 15) {
    redFlags.push(flag(
      'receivables_outpace_revenue', 'Receivables growing significantly faster than revenue', SEVERITY.MODERATE,
      'Receivables growth vs revenue growth', `Receivables ${recGrowth.toFixed(1)}%, Revenue ${revGrowth.toFixed(1)}%`, 'Prior year',
      'This can indicate looser credit terms, channel stuffing, or difficulty collecting from customers.',
      'Review customer concentration, credit policy changes, and receivable ageing if available.'
    ))
  }

  // 3. Inventory growing faster than revenue
  if (invGrowth != null && revGrowth != null && invGrowth - revGrowth > 15) {
    redFlags.push(flag(
      'inventory_outpace_revenue', 'Inventory growing significantly faster than revenue', SEVERITY.MODERATE,
      'Inventory growth vs revenue growth', `Inventory ${invGrowth.toFixed(1)}%, Revenue ${revGrowth.toFixed(1)}%`, 'Prior year',
      'Could indicate slowing sales, obsolescence risk, or overproduction relative to demand.',
      'Check inventory days trend and whether specific product lines are building up.'
    ))
  }

  // 4. Debt increasing rapidly while profitability stagnates
  if (debtGrowth != null && debtGrowth > 20 && patGrowth != null && patGrowth < 5) {
    redFlags.push(flag(
      'debt_up_profit_flat', 'Debt increasing rapidly while profitability stagnates', SEVERITY.HIGH,
      'Debt growth vs PAT growth', `Debt ${debtGrowth.toFixed(1)}%, PAT ${patGrowth.toFixed(1)}%`, 'Prior year',
      'Borrowing to fund operations without a corresponding increase in profitability raises solvency risk.',
      'Understand what the additional debt was used for (capex, working capital, refinancing) and its repayment schedule.'
    ))
  } else if (debtGrowth != null && debtGrowth < -10) {
    positives.push({ title: 'Active deleveraging', detail: `Total debt declined ${Math.abs(debtGrowth).toFixed(1)}% year-on-year, reducing financial risk.` })
  }

  // 5. Sharp decline in interest coverage
  if (solv.interestCoverage != null && solvPrev.interestCoverage != null) {
    const drop = solvPrev.interestCoverage - solv.interestCoverage
    if (solvPrev.interestCoverage > 0 && drop / solvPrev.interestCoverage > 0.3) {
      redFlags.push(flag(
        'interest_coverage_decline', 'Sharp decline in interest coverage', SEVERITY.HIGH,
        'Interest Coverage Ratio', `${solv.interestCoverage.toFixed(2)}x`, `${solvPrev.interestCoverage.toFixed(2)}x prior year`,
        'A shrinking cushion between operating earnings and interest obligations increases default risk if earnings weaken further.',
        'Check whether the decline is from falling EBIT, rising finance costs, or both.'
      ))
    } else if (solv.interestCoverage > solvPrev.interestCoverage * 1.2) {
      positives.push({ title: 'Improved interest coverage', detail: `Interest coverage improved from ${solvPrev.interestCoverage.toFixed(2)}x to ${solv.interestCoverage.toFixed(2)}x.` })
    }
  }

  // 6. Sharp margin compression
  if (prof.netProfitMargin != null && profPrev.netProfitMargin != null) {
    const change = prof.netProfitMargin - profPrev.netProfitMargin
    if (change < -3) {
      redFlags.push(flag(
        'margin_compression', 'Unexplained net margin compression', SEVERITY.MODERATE,
        'Net Profit Margin', `${prof.netProfitMargin.toFixed(1)}%`, `${profPrev.netProfitMargin.toFixed(1)}% prior year`,
        'Margin compression can stem from pricing pressure, rising input costs, or one-off charges.',
        'Break down the change between gross margin, operating costs, and below-the-line items.'
      ))
    } else if (change > 3) {
      positives.push({ title: 'Margin expansion', detail: `Net profit margin expanded from ${profPrev.netProfitMargin.toFixed(1)}% to ${prof.netProfitMargin.toFixed(1)}%.` })
    }
  }

  // 7. Large increase in other income relative to operating revenue
  if (otherIncomeGrowth != null && otherIncome != null && revGrowth != null) {
    const revenue = get(data, 'revenue', year)
    const otherIncomeShare = revenue ? (otherIncome / revenue) * 100 : null
    if (otherIncomeGrowth > 50 && otherIncomeShare != null && otherIncomeShare > 5) {
      redFlags.push(flag(
        'other_income_spike', 'Large increase in other income relative to operating revenue', SEVERITY.MODERATE,
        'Other income growth', `${otherIncomeGrowth.toFixed(1)}%, now ${otherIncomeShare.toFixed(1)}% of revenue`, 'Prior year',
        'Heavy reliance on non-operating income can flatter reported profit without reflecting the core business trend.',
        'Identify the source of other income and whether it is recurring.'
      ))
    }
  }

  // 8. Repeated negative free cash flow
  const cfPrev = cashFlowMetrics(data, prevYear)
  if (cf.fcf != null && cfPrev.fcf != null && cf.fcf < 0 && cfPrev.fcf < 0) {
    redFlags.push(flag(
      'repeated_negative_fcf', 'Repeated negative free cash flow', SEVERITY.HIGH,
      'Free Cash Flow', `${cf.fcf.toFixed(1)}`, `${cfPrev.fcf.toFixed(1)} prior year`,
      'Sustained negative FCF means the business is consuming cash and depends on external financing or existing reserves.',
      'Assess whether this is temporary (growth-stage capex) or structural.'
    ))
  } else if (cf.fcf != null && cf.fcf > 0 && cfPrev.fcf != null && cfPrev.fcf > 0) {
    positives.push({ title: 'Consistent free cash flow generation', detail: 'The company generated positive free cash flow in both the current and prior year.' })
  }

  // 9. EPS vs PAT divergence (possible dilution)
  const epsGrowth = yoyGrowth(data, 'eps', year)
  if (epsGrowth != null && patGrowth != null && patGrowth - epsGrowth > 10) {
    redFlags.push(flag(
      'eps_pat_divergence', 'EPS growth lagging PAT growth', SEVERITY.LOW,
      'EPS growth vs PAT growth', `EPS ${epsGrowth.toFixed(1)}%, PAT ${patGrowth.toFixed(1)}%`, 'Prior year',
      'This gap often indicates share dilution from new issuance, ESOPs, or convertible instruments.',
      'Check for changes in weighted average share count.'
    ))
  }

  // Growth positive
  if (revGrowth != null && revGrowth > 15) {
    positives.push({ title: 'Strong revenue growth', detail: `Revenue grew ${revGrowth.toFixed(1)}% year-on-year.` })
  }

  const du = dupont(data, year)
  return { redFlags, positives, dupontNote: du }
}
