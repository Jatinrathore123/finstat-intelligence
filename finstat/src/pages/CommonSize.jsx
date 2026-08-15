import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader, formatNumber } from '../components/UI'
import { commonSizeIncomeStatement, commonSizeBalanceSheet } from '../lib/calculations'
import { TAXONOMY_MAP } from '../lib/taxonomy'
import { useNavigate } from 'react-router-dom'

const PNL_KEYS = ['cogs', 'gross_profit', 'employee_cost', 'other_expenses', 'ebitda', 'depreciation', 'ebit', 'finance_cost', 'pbt', 'tax_expense', 'pat']
const BS_ASSET_KEYS = ['cash', 'trade_receivables', 'inventories', 'other_current_assets', 'current_assets', 'ppe', 'other_noncurrent_assets', 'noncurrent_assets']
const BS_LIAB_KEYS = ['total_equity', 'borrowings_ltd', 'borrowings_std', 'total_debt', 'trade_payables', 'other_current_liabilities', 'current_liabilities', 'noncurrent_liabilities']

export default function CommonSize() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData) return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />

  return (
    <div>
      <SectionHeader title="Common-Size Analysis" description="Every line item expressed as a percentage of revenue (income statement) or total assets (balance sheet) — makes structure and trend comparable across years regardless of scale." />

      <div className="font-display text-lg mb-3">Income Statement (% of Revenue)</div>
      <CommonSizeTable years={data.years} rowKeys={PNL_KEYS} compute={commonSizeIncomeStatement} data={data} baseLabel="Revenue" />

      <div className="font-display text-lg mb-3 mt-8">Balance Sheet — Assets (% of Total Assets)</div>
      <CommonSizeTable years={data.years} rowKeys={BS_ASSET_KEYS} compute={commonSizeBalanceSheet} data={data} />

      <div className="font-display text-lg mb-3 mt-8">Balance Sheet — Equity & Liabilities (% of Total Assets)</div>
      <CommonSizeTable years={data.years} rowKeys={BS_LIAB_KEYS} compute={commonSizeBalanceSheet} data={data} />
    </div>
  )
}

function CommonSizeTable({ years, rowKeys, compute, data }) {
  const byYear = Object.fromEntries(years.map(y => [y, compute(data, y)]))
  return (
    <table className="w-full ledger-card dir-flat mb-2">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
          <th className="py-2">Line item</th>
          {years.map(y => <th key={y} className="py-2 text-right">{y}</th>)}
        </tr>
      </thead>
      <tbody>
        {rowKeys.map(k => (
          <tr key={k} className="border-b border-line last:border-0">
            <td className="py-2 text-sm">{TAXONOMY_MAP[k]?.label || k}</td>
            {years.map(y => (
              <td key={y} className="py-2 text-right num text-sm">
                {byYear[y][k] == null ? '—' : formatNumber(byYear[y][k], { suffix: '%' })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
