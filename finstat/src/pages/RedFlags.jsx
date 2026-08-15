import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader } from '../components/UI'
import { analyzeSignals } from '../lib/redFlags'
import { useNavigate } from 'react-router-dom'

export default function RedFlags() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData || data.years.length < 2) {
    return (
      <EmptyState
        title="Need at least two years of data"
        detail="Red flag and positive signal detection compares the latest year against the prior year."
        action={<button onClick={() => navigate('/review')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Go to Review Data</button>}
      />
    )
  }

  const year = data.years[data.years.length - 1]
  const { redFlags, positives } = analyzeSignals(data, year)

  return (
    <div>
      <SectionHeader eyebrow={`Latest period: ${year}`} title="Red Flags & Positive Signals" description="Rule-based screening across profitability, cash flow, leverage, and working capital trends. None of these are conclusions — they're starting points for investigation." />

      <div className="font-display text-lg mb-3">Red Flags {redFlags.length > 0 && <span className="text-sm text-ink/40 font-body">({redFlags.length})</span>}</div>
      {redFlags.length === 0 ? (
        <div className="text-sm text-ink/50 mb-8">No rule-based red flags detected for this period.</div>
      ) : (
        <div className="space-y-3 mb-8">
          {redFlags.map(f => (
            <div key={f.id} className="ledger-card dir-down">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs">{f.severity}</div>
              </div>
              <div className="text-xs text-ink/50 mt-1 num">{f.metric}: {f.current} (vs {f.comparison})</div>
              <div className="text-sm text-ink/70 mt-2">{f.why}</div>
              <div className="text-xs text-ink/50 mt-2"><span className="text-ink/40">Investigate: </span>{f.investigate}</div>
            </div>
          ))}
        </div>
      )}

      <div className="font-display text-lg mb-3">Positive Signals {positives.length > 0 && <span className="text-sm text-ink/40 font-body">({positives.length})</span>}</div>
      {positives.length === 0 ? (
        <div className="text-sm text-ink/50">No notable positive signals detected for this period.</div>
      ) : (
        <div className="space-y-3">
          {positives.map((p, i) => (
            <div key={i} className="ledger-card dir-up">
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-sm text-ink/70 mt-1">{p.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
