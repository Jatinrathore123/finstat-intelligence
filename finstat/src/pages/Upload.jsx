import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseUploadedFile } from '../lib/parsers'
import { useStore } from '../store/useStore'
import { SectionHeader } from '../components/UI'
import { TAXONOMY } from '../lib/taxonomy'

const TEMPLATE_CSV = `Line Item,FY24,FY25,FY26
Revenue from Operations,1000,1150,1320
Other Income,20,18,25
Cost of Goods Sold,610,640,690
Employee Benefit Expense,90,100,115
Other Expenses,120,125,140
EBITDA,200,278,375
Depreciation and Amortization Expense,40,45,52
Finance Costs,25,28,30
Profit Before Tax,135,205,293
Tax Expense,34,52,74
Profit After Tax,101,153,219
Basic Earnings Per Share,10.1,15.3,21.9
Cash and Cash Equivalents,80,95,140
Trade Receivables,150,175,190
Inventories,120,140,150
Total Current Assets,400,470,540
Property Plant and Equipment,600,650,700
Total Non-Current Assets,650,700,760
Total Assets,1050,1170,1300
Total Equity,590,700,860
Long-Term Borrowings,220,210,180
Short-Term Borrowings,60,70,65
Total Borrowings,280,280,245
Trade Payables,110,120,130
Total Current Liabilities,230,255,260
Total Non-Current Liabilities,230,215,180
Total Liabilities,460,470,440
Net Cash from Operating Activities,160,190,260
Net Cash used in Investing Activities,-70,-80,-90
Net Cash used in Financing Activities,-60,-75,-70
Purchase of Property Plant and Equipment,-75,-85,-95
`

export default function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const loadParsedRows = useStore(s => s.loadParsedRows)

  async function handleFile(file) {
    setError('')
    setBusy(true)
    try {
      const { years, entries } = await parseUploadedFile(file)
      if (years.length === 0) {
        throw new Error('Could not find any year columns. The first row should be headers like "Line Item, FY24, FY25, FY26".')
      }
      loadParsedRows(years, entries, { companyName: file.name.replace(/\.[^.]+$/, '') })
      navigate('/review')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'finstat-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function startManualEntry() {
    loadParsedRows(['FY24', 'FY25', 'FY26'], [], { companyName: '' })
    navigate('/review')
  }

  return (
    <div className="max-w-3xl">
      <SectionHeader
        eyebrow="Step 1"
        title="Upload financial statements"
        description="Everything is parsed and calculated in your browser. Nothing is uploaded to a server."
      />

      <div
        className="border-2 border-dashed border-line rounded-sm p-10 text-center bg-white cursor-pointer hover:border-ledger transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) handleFile(f)
        }}
      >
        <div className="font-display text-lg mb-1">Drop a CSV or Excel file, or click to browse</div>
        <div className="text-sm text-ink/50">One row per line item, one column per financial year</div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {busy && <div className="text-sm text-ink/60 mt-3">Parsing…</div>}
      {error && (
        <div className="text-sm text-rose bg-rose/5 border border-rose/30 rounded-sm p-3 mt-3 whitespace-pre-wrap">{error}</div>
      )}

      <div className="flex items-center gap-4 mt-6 text-sm">
        <button onClick={downloadTemplate} className="text-ledger underline decoration-dotted">
          Download CSV template
        </button>
        <span className="text-ink/30">·</span>
        <button onClick={startManualEntry} className="text-ledger underline decoration-dotted">
          Skip upload — enter data manually
        </button>
      </div>

      <details className="mt-8 text-sm text-ink/60">
        <summary className="cursor-pointer text-ink/80">About PDFs and scanned statements</summary>
        <p className="mt-2 leading-relaxed">
          This build focuses on CSV/Excel so calculations are reliable. Free OCR/PDF-table
          extraction for arbitrary annual report layouts is not accurate enough to trust
          without human review, and paid extraction services aren't in scope for a $0 budget.
          The most reliable path: copy the line items from the PDF into the template above,
          or use the manual entry table on the next screen.
        </p>
      </details>

      <div className="mt-8 text-xs text-ink/40">
        Recognized line items ({TAXONOMY.length}) include Revenue, EBITDA, PAT, Total Assets,
        Total Equity, Trade Receivables, Inventories, Total Debt, CFO, Capex, and more —
        under common aliases used across company filings. Unmatched rows can be mapped manually
        on the next screen.
      </div>
    </div>
  )
}
