import { useState } from 'react'
import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader } from '../components/UI'
import { getStoredApiKey, setStoredApiKey, runAiAnalyst } from '../lib/aiAnalyst'
import {
  liquidityRatios, profitabilityRatios, solvencyRatios, efficiencyRatios,
  cashFlowMetrics, dupont, financialHealthScore, prevYearOf,
} from '../lib/calculations'
import { analyzeSignals } from '../lib/redFlags'
import { useNavigate } from 'react-router-dom'

export default function AiAnalystPage() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState(getStoredApiKey())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')

  if (!hasData) {
    return <EmptyState title="No data yet" action={<button onClick={() => navigate('/upload')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Upload statements</button>} />
  }

  const year = data.years[data.years.length - 1]
  const prevYear = prevYearOf(data, year)

  function saveKey(v) {
    setApiKey(v)
    setStoredApiKey(v)
  }

  async function runAnalysis() {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const signals = analyzeSignals(data, year)
      const snapshot = {
        liquidity: liquidityRatios(data, year),
        profitability: profitabilityRatios(data, year),
        solvency: solvencyRatios(data, year),
        efficiency: efficiencyRatios(data, year),
        cashFlow: cashFlowMetrics(data, year),
        dupont: dupont(data, year),
        healthScore: financialHealthScore(data, year),
        ruleBasedRedFlags: signals.redFlags.map(f => ({ title: f.title, metric: f.metric, current: f.current })),
        ruleBasedPositives: signals.positives.map(p => p.title),
        rawLineItems: data.items,
      }
      const text = await runAiAnalyst({ apiKey, companyName: data.meta.companyName, year, prevYear, snapshot })
      setResult(text)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader
        eyebrow={`Latest period: ${year}`}
        title="AI Analyst"
        description="Generates narrative commentary grounded only in the ratios and figures already calculated on this page — it never invents financial figures."
      />

      <div className="ledger-card dir-flat mb-6">
        <div className="text-sm mb-2">Gemini API key (free tier)</div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={e => saveKey(e.target.value)}
            placeholder="Paste your free Gemini API key"
            className="border border-line rounded-sm px-3 py-2 text-sm flex-1"
          />
        </div>
        <p className="text-xs text-ink/50 mt-2 leading-relaxed">
          Get a free key at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-ledger underline decoration-dotted">
            aistudio.google.com/apikey
          </a>. Stored only in your browser's local storage — never sent anywhere except Google's API when you click "Run analysis".
        </p>
      </div>

      <button
        onClick={runAnalysis}
        disabled={loading || !apiKey}
        className="bg-navy text-white px-5 py-2.5 rounded-sm text-sm hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing…' : 'Run analysis'}
      </button>

      {error && <div className="text-sm text-rose bg-rose/5 border border-rose/30 rounded-sm p-3 mt-4 whitespace-pre-wrap">{error}</div>}

      {result && (
        <div className="ledger-card dir-flat mt-6 prose-like">
          <MarkdownLite text={result} />
        </div>
      )}
    </div>
  )
}

// Minimal markdown renderer — headers, bold, and lists only. Avoids pulling
// in a full markdown dependency for a small amount of AI-generated text.
function MarkdownLite({ text }) {
  const lines = text.split('\n')
  return (
    <div className="text-sm leading-relaxed space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return null
        if (trimmed.startsWith('### ')) return <div key={i} className="font-display text-base mt-3">{trimmed.slice(4)}</div>
        if (trimmed.startsWith('## ')) return <div key={i} className="font-display text-lg mt-4">{trimmed.slice(3)}</div>
        if (trimmed.startsWith('# ')) return <div key={i} className="font-display text-xl mt-4">{trimmed.slice(2)}</div>
        if (/^[-*]\s+/.test(trimmed)) return <div key={i} className="pl-4">• {renderBold(trimmed.replace(/^[-*]\s+/, ''))}</div>
        return <p key={i}>{renderBold(trimmed)}</p>
      })}
    </div>
  )
}

function renderBold(str) {
  const parts = str.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  )
}
