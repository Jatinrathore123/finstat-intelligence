import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { TAXONOMY } from '../lib/taxonomy'
import { SectionHeader } from '../components/UI'
import { balanceSheetCheck } from '../lib/calculations'

export default function ReviewData() {
  const navigate = useNavigate()
  const data = useStore(s => s.data)
  const updateSourceRow = useStore(s => s.updateSourceRow)
  const recompute = useStore(s => s.recomputeItemsFromSourceRows)
  const setMeta = useStore(s => s.setMeta)
  const setYears = useStore(s => s.setYears)

  const { years, sourceRows, meta } = data

  function addRow() {
    updateSourceRow(sourceRows.length, { rawLabel: '', normalizedKey: null, confidence: 0, values: {} })
  }

  function handleContinue() {
    recompute()
    navigate('/')
  }

  const lowConfidenceCount = sourceRows.filter(r => r.normalizedKey && r.confidence < 0.75).length
  const unmatchedCount = sourceRows.filter(r => r.rawLabel && !r.normalizedKey).length

  const checks = years.map(y => ({ year: y, check: balanceSheetCheck({ items: buildItemsPreview(sourceRows), years }, y) }))

  return (
    <div>
      <SectionHeader
        eyebrow="Step 2"
        title="Review extracted data"
        description="Confirm the normalized category for each line item and fix any values before calculations run. Nothing here is trusted blindly."
      />

      <div className="ledger-card dir-flat mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Company name" value={meta.companyName} onChange={v => setMeta({ companyName: v })} />
        <Field label="Currency" value={meta.currency} onChange={v => setMeta({ currency: v })} />
        <Field label="Unit" value={meta.unit} onChange={v => setMeta({ unit: v })} />
        <Field label="Basis" value={meta.consolidated} onChange={v => setMeta({ consolidated: v })} />
      </div>

      <div className="ledger-card dir-flat mb-6">
        <div className="text-sm mb-2">Financial years (edit labels if needed, order oldest → latest)</div>
        <div className="flex gap-2 flex-wrap">
          {years.map((y, i) => (
            <input
              key={i}
              value={y}
              className="border border-line rounded-sm px-2 py-1 text-sm num w-24"
              onChange={e => {
                const next = [...years]
                next[i] = e.target.value
                setYears(next)
              }}
            />
          ))}
        </div>
      </div>

      {(lowConfidenceCount > 0 || unmatchedCount > 0) && (
        <div className="text-sm text-amber bg-amber/5 border border-amber/30 rounded-sm p-3 mb-6">
          ⚠ {unmatchedCount > 0 && `${unmatchedCount} row(s) could not be auto-matched to a standard category. `}
          {lowConfidenceCount > 0 && `${lowConfidenceCount} row(s) matched with low confidence. `}
          Review the "Category" column below.
        </div>
      )}

      {checks.map(({ year, check }) => check.checkable && !check.balances && (
        <div key={year} className="text-sm text-rose bg-rose/5 border border-rose/30 rounded-sm p-3 mb-3">
          ⚠ Balance Sheet validation failed for {year}: Total Assets ({check.totalAssets.toLocaleString()}) ≠
          Equity + Liabilities ({check.equityPlusLiabilities.toLocaleString()}). Difference: {check.difference.toLocaleString()}.
          Double-check the figures for this year.
        </div>
      ))}

      <div className="overflow-x-auto ledger-card dir-flat">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink/50 border-b border-line">
              <th className="py-2 pr-3">Original label</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Confidence</th>
              {years.map(y => <th key={y} className="py-2 pr-3 text-right">{y}</th>)}
            </tr>
          </thead>
          <tbody>
            {sourceRows.map((row, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="py-2 pr-3">
                  <input
                    className="border border-line rounded-sm px-2 py-1 w-48"
                    value={row.rawLabel}
                    onChange={e => updateSourceRow(i, { rawLabel: e.target.value })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <select
                    className="border border-line rounded-sm px-2 py-1"
                    value={row.normalizedKey || ''}
                    onChange={e => updateSourceRow(i, { normalizedKey: e.target.value || null, confidence: 1 })}
                  >
                    <option value="">— Ignore this row —</option>
                    {TAXONOMY.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-3 num text-xs">
                  {row.normalizedKey ? `${Math.round(row.confidence * 100)}%` : '—'}
                  {row.normalizedKey && row.confidence < 0.75 && ' ⚠'}
                </td>
                {years.map(y => (
                  <td key={y} className="py-2 pr-3">
                    <input
                      className="border border-line rounded-sm px-2 py-1 w-24 text-right num"
                      value={row.values?.[y] ?? ''}
                      onChange={e => {
                        const num = e.target.value === '' ? null : parseFloat(e.target.value)
                        updateSourceRow(i, { values: { ...row.values, [y]: Number.isNaN(num) ? null : num } })
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} className="text-ledger text-sm underline decoration-dotted mt-3">
          + Add row
        </button>
      </div>

      <button
        onClick={handleContinue}
        className="mt-6 bg-navy text-white px-5 py-2.5 rounded-sm text-sm hover:bg-navy-light"
      >
        Confirm and calculate →
      </button>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="text-sm">
      <div className="text-[11px] uppercase tracking-wide text-ink/50 mb-1">{label}</div>
      <input
        className="border border-line rounded-sm px-2 py-1.5 w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  )
}

function buildItemsPreview(sourceRows) {
  const items = {}
  sourceRows.forEach(e => {
    if (!e.normalizedKey) return
    items[e.normalizedKey] = items[e.normalizedKey] || {}
    Object.entries(e.values || {}).forEach(([y, v]) => {
      if (v != null) items[e.normalizedKey][y] = v
    })
  })
  return items
}
