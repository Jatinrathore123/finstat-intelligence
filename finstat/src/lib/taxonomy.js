// Standardized internal financial taxonomy.
// Each key is the normalized category. `aliases` lists the common ways
// companies label this line item, used for fuzzy matching during import.
// `statement` groups items for the Review Data screen. `group` is used
// to sum things like "total current assets" from components if a company
// doesn't report the subtotal directly.

export const TAXONOMY = [
  // ---- Income Statement ----
  { key: 'revenue', label: 'Revenue', statement: 'pnl', aliases: ['revenue from operations', 'revenue', 'net sales', 'sales', 'turnover', 'operating revenue', 'total revenue', 'income from operations'] },
  { key: 'other_income', label: 'Other Income', statement: 'pnl', aliases: ['other income', 'non-operating income'] },
  { key: 'cogs', label: 'Cost of Goods Sold', statement: 'pnl', aliases: ['cost of goods sold', 'cogs', 'cost of materials consumed', 'cost of sales', 'cost of revenue'] },
  { key: 'gross_profit', label: 'Gross Profit', statement: 'pnl', aliases: ['gross profit'] },
  { key: 'employee_cost', label: 'Employee Benefit Expense', statement: 'pnl', aliases: ['employee benefit expense', 'employee cost', 'personnel expense', 'staff costs'] },
  { key: 'other_expenses', label: 'Other Expenses', statement: 'pnl', aliases: ['other expenses', 'other operating expenses'] },
  { key: 'ebitda', label: 'EBITDA', statement: 'pnl', aliases: ['ebitda', 'earnings before interest tax depreciation and amortization'] },
  { key: 'depreciation', label: 'Depreciation & Amortization', statement: 'pnl', aliases: ['depreciation and amortization expense', 'depreciation', 'd&a'] },
  { key: 'ebit', label: 'EBIT', statement: 'pnl', aliases: ['ebit', 'operating profit', 'profit from operations'] },
  { key: 'finance_cost', label: 'Finance Cost', statement: 'pnl', aliases: ['finance costs', 'interest expense', 'finance cost'] },
  { key: 'pbt', label: 'Profit Before Tax', statement: 'pnl', aliases: ['profit before tax', 'pbt', 'profit before taxation'] },
  { key: 'tax_expense', label: 'Tax Expense', statement: 'pnl', aliases: ['tax expense', 'total tax expense', 'income tax expense', 'current tax'] },
  { key: 'pat', label: 'Profit After Tax', statement: 'pnl', aliases: ['profit after tax', 'pat', 'net profit', 'profit for the year', 'profit for the period'] },
  { key: 'eps', label: 'EPS (Basic)', statement: 'pnl', aliases: ['basic earnings per share', 'eps basic', 'earnings per share'] },

  // ---- Balance Sheet: Assets ----
  { key: 'cash', label: 'Cash & Cash Equivalents', statement: 'bs_asset', aliases: ['cash and cash equivalents', 'cash and bank balances', 'cash & bank balance'] },
  { key: 'trade_receivables', label: 'Trade Receivables', statement: 'bs_asset', aliases: ['trade receivables', 'accounts receivable', 'sundry debtors'] },
  { key: 'inventories', label: 'Inventories', statement: 'bs_asset', aliases: ['inventories', 'inventory', 'stock in trade'] },
  { key: 'other_current_assets', label: 'Other Current Assets', statement: 'bs_asset', aliases: ['other current assets', 'short-term loans and advances'] },
  { key: 'current_assets', label: 'Total Current Assets', statement: 'bs_asset', aliases: ['total current assets', 'current assets'] },
  { key: 'ppe', label: 'Property, Plant & Equipment', statement: 'bs_asset', aliases: ['property plant and equipment', 'ppe', 'fixed assets', 'tangible assets', 'net block'] },
  { key: 'other_noncurrent_assets', label: 'Other Non-Current Assets', statement: 'bs_asset', aliases: ['other non-current assets', 'non-current investments', 'intangible assets'] },
  { key: 'noncurrent_assets', label: 'Total Non-Current Assets', statement: 'bs_asset', aliases: ['total non-current assets', 'non-current assets'] },
  { key: 'total_assets', label: 'Total Assets', statement: 'bs_asset', aliases: ['total assets'] },

  // ---- Balance Sheet: Equity & Liabilities ----
  { key: 'share_capital', label: 'Share Capital', statement: 'bs_equity', aliases: ['share capital', 'equity share capital'] },
  { key: 'reserves', label: 'Reserves & Surplus', statement: 'bs_equity', aliases: ['reserves and surplus', 'other equity', 'retained earnings'] },
  { key: 'total_equity', label: 'Total Equity / Net Worth', statement: 'bs_equity', aliases: ['total equity', 'shareholders funds', 'net worth', 'total shareholders equity'] },
  { key: 'borrowings_ltd', label: 'Long-Term Borrowings', statement: 'bs_liability', aliases: ['long-term borrowings', 'non-current borrowings', 'long term debt'] },
  { key: 'borrowings_std', label: 'Short-Term Borrowings', statement: 'bs_liability', aliases: ['short-term borrowings', 'current borrowings', 'short term debt'] },
  { key: 'total_debt', label: 'Total Debt / Borrowings', statement: 'bs_liability', aliases: ['total borrowings', 'total debt'] },
  { key: 'trade_payables', label: 'Trade Payables', statement: 'bs_liability', aliases: ['trade payables', 'accounts payable', 'sundry creditors'] },
  { key: 'other_current_liabilities', label: 'Other Current Liabilities', statement: 'bs_liability', aliases: ['other current liabilities', 'short-term provisions'] },
  { key: 'current_liabilities', label: 'Total Current Liabilities', statement: 'bs_liability', aliases: ['total current liabilities', 'current liabilities'] },
  { key: 'noncurrent_liabilities', label: 'Total Non-Current Liabilities', statement: 'bs_liability', aliases: ['total non-current liabilities', 'non-current liabilities'] },
  { key: 'total_liabilities', label: 'Total Liabilities', statement: 'bs_liability', aliases: ['total liabilities'] },

  // ---- Cash Flow Statement ----
  { key: 'cfo', label: 'Cash Flow from Operations', statement: 'cf', aliases: ['net cash from operating activities', 'cash flow from operations', 'cfo', 'operating cash flow'] },
  { key: 'cfi', label: 'Cash Flow from Investing', statement: 'cf', aliases: ['net cash used in investing activities', 'cash flow from investing activities', 'cfi'] },
  { key: 'cff', label: 'Cash Flow from Financing', statement: 'cf', aliases: ['net cash used in financing activities', 'cash flow from financing activities', 'cff'] },
  { key: 'capex', label: 'Capital Expenditure', statement: 'cf', aliases: ['purchase of fixed assets', 'capital expenditure', 'capex', 'purchase of property plant and equipment'] },
  { key: 'dividends_paid', label: 'Dividends Paid', statement: 'cf', aliases: ['dividend paid', 'dividends paid'] },
  { key: 'opening_cash', label: 'Opening Cash Balance', statement: 'cf', aliases: ['cash and cash equivalents at beginning', 'opening balance of cash'] },
  { key: 'closing_cash', label: 'Closing Cash Balance', statement: 'cf', aliases: ['cash and cash equivalents at end', 'closing balance of cash'] },
]

export const TAXONOMY_MAP = Object.fromEntries(TAXONOMY.map(t => [t.key, t]))

// Normalize a free-text label for matching: lowercase, strip punctuation/whitespace
function normalizeLabel(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Given a raw row label from an uploaded file, guess the best matching
// taxonomy key. Returns { key, confidence (0-1) } or null if no reasonable match.
export function matchLineItem(rawLabel) {
  const norm = normalizeLabel(rawLabel)
  if (!norm) return null

  let best = null
  for (const item of TAXONOMY) {
    for (const alias of item.aliases) {
      const a = normalizeLabel(alias)
      if (norm === a) return { key: item.key, confidence: 0.99 }
      if (norm.includes(a) || a.includes(norm)) {
        const score = Math.min(a.length, norm.length) / Math.max(a.length, norm.length)
        if (!best || score > best.confidence) {
          best = { key: item.key, confidence: Math.max(0.55, score * 0.9) }
        }
      }
    }
  }
  return best
}

export const UNIT_MULTIPLIERS = {
  'unit': 1,
  'thousand': 1e3,
  'lakh': 1e5,
  'million': 1e6,
  'crore': 1e7,
  'billion': 1e9,
}
