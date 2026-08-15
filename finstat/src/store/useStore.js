import { create } from 'zustand'
import { TAXONOMY_MAP } from '../lib/taxonomy'

// data.items: { [normalizedKey]: { [year]: number } }
// data.years: string[] in chronological order (oldest -> newest)
// data.meta: { companyName, currency, unit, consolidated }

const emptyData = {
  years: [],
  items: {},
  meta: { companyName: '', currency: '₹', unit: 'crore', consolidated: 'Standalone' },
  sourceRows: [], // raw parsed rows with normalizedKey/confidence, for the Review screen
}

export const useStore = create((set, get) => ({
  data: emptyData,
  hasData: false,

  loadParsedRows(years, entries, meta = {}) {
    const items = {}
    entries.forEach(e => {
      if (!e.normalizedKey) return
      items[e.normalizedKey] = items[e.normalizedKey] || {}
      years.forEach(y => {
        if (e.values[y] != null) items[e.normalizedKey][y] = e.values[y]
      })
    })
    set({
      data: {
        years,
        items,
        meta: { ...emptyData.meta, ...meta },
        sourceRows: entries,
      },
      hasData: entries.length > 0,
    })
  },

  updateSourceRow(index, patch) {
    const rows = [...get().data.sourceRows]
    rows[index] = { ...rows[index], ...patch }
    set({ data: { ...get().data, sourceRows: rows } })
  },

  // Rebuild `items` from the (possibly user-edited) sourceRows
  recomputeItemsFromSourceRows() {
    const { years, sourceRows } = get().data
    const items = {}
    sourceRows.forEach(e => {
      if (!e.normalizedKey) return
      items[e.normalizedKey] = items[e.normalizedKey] || {}
      years.forEach(y => {
        if (e.values[y] != null) items[e.normalizedKey][y] = e.values[y]
      })
    })
    set({ data: { ...get().data, items } })
  },

  setMeta(patch) {
    set({ data: { ...get().data, meta: { ...get().data.meta, ...patch } } })
  },

  setManualValue(key, year, value) {
    const items = { ...get().data.items }
    items[key] = { ...(items[key] || {}) }
    items[key][year] = value
    set({ data: { ...get().data, items }, hasData: true })
  },

  setYears(years) {
    set({ data: { ...get().data, years } })
  },

  reset() {
    set({ data: emptyData, hasData: false })
  },

  latestYear() {
    const years = get().data.years
    return years.length ? years[years.length - 1] : null
  },
}))

export { TAXONOMY_MAP }
