// Pure functions only — no side effects, no network calls.
// `data` shape: { years: ['FY24','FY25','FY26'], items: { revenue: {FY24: 100, ...}, ... } }

function get(data, key, year) {
  const v = data.items?.[key]?.[year]
  return typeof v === 'number' && !Number.isNaN(v) ? v : null
}

function avg(data, key, year, prevYear) {
  const cur = get(data, key, year)
  const prev = prevYear ? get(data, key, prevYear) : null
  if (cur == null) return null
  if (prev == null) return cur
  return (cur + prev) / 2
}

function div(a, b) {
  if (a == null || b == null || b === 0) return null
  return a / b
}

function pct(a, b) {
  const r = div(a, b)
  return r == null ? null : r * 100
}

function prevYearOf(data, year) {
  const idx = data.years.indexOf(year)
  return idx > 0 ? data.years[idx - 1] : null
}

// ---------- Liquidity ----------
export function liquidityRatios(data, year) {
  const ca = get(data, 'current_assets', year)
  const cl = get(data, 'current_liabilities', year)
  const inv = get(data, 'inventories', year)
  const cash = get(data, 'cash', year)
  const revenue = get(data, 'revenue', year)
  const workingCapital = ca != null && cl != null ? ca - cl : null
  return {
    currentRatio: div(ca, cl),
    quickRatio: ca != null && inv != null ? div(ca - inv, cl) : null,
    cashRatio: div(cash, cl),
    workingCapital,
    workingCapitalToRevenue: div(workingCapital, revenue),
  }
}

// ---------- Profitability ----------
export function profitabilityRatios(data, year) {
  const prevYear = prevYearOf(data, year)
  const revenue = get(data, 'revenue', year)
  const cogs = get(data, 'cogs', year)
  const grossProfit = get(data, 'gross_profit', year) ?? (revenue != null && cogs != null ? revenue - cogs : null)
  const ebitda = get(data, 'ebitda', year)
  const ebit = get(data, 'ebit', year) ?? (ebitda != null && get(data, 'depreciation', year) != null ? ebitda - get(data, 'depreciation', year) : null)
  const pbt = get(data, 'pbt', year)
  const pat = get(data, 'pat', year)
  const totalAssets = avg(data, 'total_assets', year, prevYear)
  const equity = avg(data, 'total_equity', year, prevYear)
  const ebitVal = ebit
  const debt = get(data, 'total_debt', year)
  const capitalEmployed = equity != null && debt != null ? equity + debt : null

  return {
    grossProfitMargin: pct(grossProfit, revenue),
    ebitdaMargin: pct(ebitda, revenue),
    ebitMargin: pct(ebitVal, revenue),
    pbtMargin: pct(pbt, revenue),
    netProfitMargin: pct(pat, revenue),
    roa: pct(pat, totalAssets),
    roe: pct(pat, equity),
    roce: pct(ebitVal, capitalEmployed),
  }
}

// ---------- Solvency / Leverage ----------
export function solvencyRatios(data, year) {
  const debt = get(data, 'total_debt', year)
  const equity = get(data, 'total_equity', year)
  const totalAssets = get(data, 'total_assets', year)
  const ebit = get(data, 'ebit', year)
  const financeCost = get(data, 'finance_cost', year)
  const cash = get(data, 'cash', year)
  const ebitda = get(data, 'ebitda', year)
  const netDebt = debt != null && cash != null ? debt - cash : null

  return {
    debtToEquity: div(debt, equity),
    debtRatio: div(debt, totalAssets),
    equityRatio: div(equity, totalAssets),
    interestCoverage: div(ebit, financeCost),
    netDebt,
    netDebtToEbitda: ebitda === 0 ? null : div(netDebt, ebitda),
    ebitdaIsNonPositive: ebitda != null && ebitda <= 0,
  }
}

// ---------- Efficiency ----------
export function efficiencyRatios(data, year, daysInYear = 365) {
  const prevYear = prevYearOf(data, year)
  const revenue = get(data, 'revenue', year)
  const cogs = get(data, 'cogs', year)
  const avgAssets = avg(data, 'total_assets', year, prevYear)
  const avgInventory = avg(data, 'inventories', year, prevYear)
  const avgReceivables = avg(data, 'trade_receivables', year, prevYear)
  const avgPayables = avg(data, 'trade_payables', year, prevYear)

  const inventoryDays = cogs ? div(avgInventory, cogs) * daysInYear : null
  const receivableDays = revenue ? div(avgReceivables, revenue) * daysInYear : null
  const payableDays = cogs ? div(avgPayables, cogs) * daysInYear : null

  return {
    assetTurnover: div(revenue, avgAssets),
    inventoryTurnover: div(cogs, avgInventory),
    receivablesTurnover: div(revenue, avgReceivables),
    payablesTurnover: div(cogs, avgPayables),
    inventoryDays,
    receivableDays,
    payableDays,
    cashConversionCycle:
      inventoryDays != null && receivableDays != null && payableDays != null
        ? inventoryDays + receivableDays - payableDays
        : null,
  }
}

// ---------- Cash Flow ----------
export function cashFlowMetrics(data, year) {
  const cfo = get(data, 'cfo', year)
  const capex = get(data, 'capex', year)
  const pat = get(data, 'pat', year)
  const revenue = get(data, 'revenue', year)
  const fcf = cfo != null && capex != null ? cfo - Math.abs(capex) : null

  return {
    cfo,
    cfi: get(data, 'cfi', year),
    cff: get(data, 'cff', year),
    fcf,
    cfoToPat: div(cfo, pat),
    cfoToRevenue: pct(cfo, revenue),
    capexToRevenue: pct(capex, revenue),
  }
}

// ---------- Growth / CAGR ----------
export function yoyGrowth(data, key, year) {
  const prevYear = prevYearOf(data, year)
  if (!prevYear) return null
  const cur = get(data, key, year)
  const prev = get(data, key, prevYear)
  if (cur == null || prev == null || prev === 0) return null
  return ((cur - prev) / Math.abs(prev)) * 100
}

// n = number of periods between first and last (years - 1)
export function cagr(beginValue, endValue, n) {
  if (beginValue == null || endValue == null || n <= 0) return null
  if (beginValue <= 0 || endValue <= 0) return null // CAGR undefined for non-positive values
  return (Math.pow(endValue / beginValue, 1 / n) - 1) * 100
}

export function cagrForKey(data, key) {
  const years = data.years
  if (years.length < 2) return null
  const begin = get(data, key, years[0])
  const end = get(data, key, years[years.length - 1])
  return cagr(begin, end, years.length - 1)
}

// ---------- DuPont ----------
export function dupont(data, year) {
  const prevYear = prevYearOf(data, year)
  const pat = get(data, 'pat', year)
  const revenue = get(data, 'revenue', year)
  const avgAssets = avg(data, 'total_assets', year, prevYear)
  const avgEquity = avg(data, 'total_equity', year, prevYear)

  const netMargin = div(pat, revenue)
  const assetTurnover = div(revenue, avgAssets)
  const equityMultiplier = div(avgAssets, avgEquity)
  const roe =
    netMargin != null && assetTurnover != null && equityMultiplier != null
      ? netMargin * assetTurnover * equityMultiplier * 100
      : null

  return { netMargin: netMargin != null ? netMargin * 100 : null, assetTurnover, equityMultiplier, roe }
}

// ---------- Common-size ----------
export function commonSizeIncomeStatement(data, year) {
  const revenue = get(data, 'revenue', year)
  const keys = ['cogs', 'gross_profit', 'employee_cost', 'other_expenses', 'ebitda', 'depreciation', 'ebit', 'finance_cost', 'pbt', 'tax_expense', 'pat']
  const out = {}
  keys.forEach(k => { out[k] = pct(get(data, k, year), revenue) })
  return out
}

export function commonSizeBalanceSheet(data, year) {
  const totalAssets = get(data, 'total_assets', year)
  const assetKeys = ['cash', 'trade_receivables', 'inventories', 'other_current_assets', 'current_assets', 'ppe', 'other_noncurrent_assets', 'noncurrent_assets']
  const liabKeys = ['total_equity', 'borrowings_ltd', 'borrowings_std', 'total_debt', 'trade_payables', 'other_current_liabilities', 'current_liabilities', 'noncurrent_liabilities']
  const out = {}
  ;[...assetKeys, ...liabKeys].forEach(k => { out[k] = pct(get(data, k, year), totalAssets) })
  return out
}

// ---------- Financial Health Score ----------
// Simple, transparent scoring: each pillar scored 0-100 from a few signals,
// clamped, then averaged. This is intentionally simple/explainable rather
// than a black-box model, and is explicitly NOT investment advice.
function clamp(n, min = 0, max = 100) {
  if (n == null) return null
  return Math.max(min, Math.min(max, n))
}

function scoreFromRange(value, low, high) {
  // maps value linearly onto 0-100 between low and high
  if (value == null) return null
  if (high === low) return 50
  return clamp(((value - low) / (high - low)) * 100)
}

export function financialHealthScore(data, year) {
  const liq = liquidityRatios(data, year)
  const prof = profitabilityRatios(data, year)
  const solv = solvencyRatios(data, year)
  const eff = efficiencyRatios(data, year)
  const cf = cashFlowMetrics(data, year)
  const revGrowth = yoyGrowth(data, 'revenue', year)

  const pillars = {
    profitability: scoreFromRange(prof.netProfitMargin, 0, 20),
    liquidity: scoreFromRange(liq.currentRatio, 0.5, 2),
    solvency: scoreFromRange(solv.interestCoverage, 1, 8),
    efficiency: scoreFromRange(eff.assetTurnover, 0.3, 1.5),
    cashFlow: scoreFromRange(cf.cfoToPat, 0.5, 1.5),
    growth: scoreFromRange(revGrowth, 0, 20),
    capitalStructure: scoreFromRange(solv.debtToEquity, 2, 0), // lower D/E is better -> inverted range
  }

  const validScores = Object.values(pillars).filter(v => v != null)
  const overall = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null

  return { overall, pillars }
}

export function balanceSheetCheck(data, year) {
  const totalAssets = get(data, 'total_assets', year)
  const equity = get(data, 'total_equity', year)
  const liabilities = get(data, 'total_liabilities', year)
  if (totalAssets == null || equity == null || liabilities == null) {
    return { checkable: false }
  }
  const diff = totalAssets - (equity + liabilities)
  const tolerance = Math.abs(totalAssets) * 0.005 // 0.5% tolerance for rounding
  return {
    checkable: true,
    balances: Math.abs(diff) <= tolerance,
    totalAssets,
    equityPlusLiabilities: equity + liabilities,
    difference: diff,
  }
}

export { get as getValue, div, pct, prevYearOf, avg }
