import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { matchLineItem } from './taxonomy'

// Expected upload shape: first column = line item label, subsequent
// columns = one per financial year (e.g. "FY24", "FY25", "FY26").
// Everything runs client-side; nothing is uploaded anywhere.

function toRows(sheetArray) {
  // sheetArray: array of arrays (rows of cells)
  const rows = sheetArray.filter(r => r && r.some(c => c !== '' && c != null))
  if (rows.length === 0) return { years: [], entries: [] }

  const header = rows[0]
  const years = header.slice(1).map(h => String(h).trim()).filter(Boolean)

  const entries = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const label = String(row[0] ?? '').trim()
    if (!label) continue
    const values = {}
    years.forEach((y, idx) => {
      const raw = row[idx + 1]
      const num = parseNumericCell(raw)
      values[y] = num
    })
    const match = matchLineItem(label)
    entries.push({
      rawLabel: label,
      normalizedKey: match?.key ?? null,
      confidence: match?.confidence ?? 0,
      values,
    })
  }
  return { years, entries }
}

// Handles numbers with commas, currency symbols, parentheses for negatives
// e.g. "(1,234.5)" -> -1234.5, "₹1,284" -> 1284
export function parseNumericCell(raw) {
  if (raw == null || raw === '') return null
  if (typeof raw === 'number') return raw
  let s = String(raw).trim()
  if (!s) return null
  const isNegative = /^\(.*\)$/.test(s)
  s = s.replace(/[()]/g, '')
  s = s.replace(/[^0-9.\-]/g, '')
  if (s === '' || s === '-') return null
  const n = parseFloat(s)
  if (Number.isNaN(n)) return null
  return isNegative ? -Math.abs(n) : n
}

export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          resolve(toRows(results.data))
        } catch (e) {
          reject(e)
        }
      },
      error: reject,
      skipEmptyLines: true,
    })
  })
}

export async function parseExcelFile(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  const sheet = wb.Sheets[sheetName]
  const arr = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' })
  return toRows(arr)
}

export async function parseUploadedFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'csv') return parseCSVFile(file)
  if (['xlsx', 'xls'].includes(ext)) return parseExcelFile(file)
  throw new Error(
    `"${file.name}" is a .${ext} file. This build parses CSV and Excel directly. ` +
    `For PDFs or scanned statements, open the statement, copy the line items into the ` +
    `template (or the manual entry table), or convert it to CSV first — free-tier OCR ` +
    `for arbitrary PDF layouts isn't reliable enough to trust without a paid service.`
  )
}
