import { SectionHeader } from '../components/UI'

export default function Methodology() {
  return (
    <div className="max-w-2xl">
      <SectionHeader title="Methodology" description="How this platform extracts, normalizes, and calculates." />
      <div className="space-y-6 text-sm leading-relaxed text-ink/70">
        <div>
          <div className="font-display text-base text-ink mb-1">Data extraction</div>
          Uploaded CSV/Excel rows are matched against a standardized taxonomy of ~35 common line
          items using alias matching (e.g. "Revenue from Operations", "Net Sales", and "Turnover"
          all map to "Revenue"). Every match is shown with a confidence score and can be corrected
          on the Review Data screen — nothing is calculated on unconfirmed data silently.
        </div>
        <div>
          <div className="font-display text-base text-ink mb-1">"Latest year" logic</div>
          The dashboard and all ratio pages always analyze the last column in your years list
          (left-to-right, oldest to newest) as the current period, using the prior column as the
          comparison year. Add a new year's column in Review Data and every page updates automatically.
        </div>
        <div>
          <div className="font-display text-base text-ink mb-1">Averages</div>
          Return ratios (ROE, ROA, ROCE, turnover ratios) use the average of the current and prior
          year's balance-sheet figure where a prior year exists, consistent with standard practice,
          and fall back to the single year-end figure otherwise.
        </div>
        <div>
          <div className="font-display text-base text-ink mb-1">Financial Health Score</div>
          A simple, transparent 0–100 composite built from seven pillars (profitability, liquidity,
          solvency, efficiency, cash flow, growth, capital structure), each scored by mapping one
          representative ratio onto a fixed range. This is intentionally simple and inspectable
          rather than a black-box model, and is explicitly not investment advice.
        </div>
        <div>
          <div className="font-display text-base text-ink mb-1">Red flags</div>
          Rule-based checks compare year-on-year movements (e.g. receivables growth vs revenue
          growth, PAT growth vs CFO growth) against fixed thresholds. Flags are framed as items to
          investigate, not conclusions.
        </div>
        <div>
          <div className="font-display text-base text-ink mb-1">AI Analyst</div>
          The AI Analyst is given only the already-computed ratios and raw line items as structured
          data and instructed not to invent figures. It uses a free-tier Gemini API key that you
          provide and store locally in your own browser.
        </div>
        <div>
          <div className="font-display text-base text-ink mb-1">Limitations</div>
          This is a student/personal project, not a licensed financial analysis tool. It does not
          replace professional judgment, doesn't have access to industry benchmark data, and its
          extraction accuracy depends entirely on how cleanly the source file is formatted.
        </div>
      </div>
    </div>
  )
}
