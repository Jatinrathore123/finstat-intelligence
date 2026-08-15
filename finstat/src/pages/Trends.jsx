import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useStore } from '../store/useStore'
import { EmptyState, SectionHeader } from '../components/UI'
import { getValue, profitabilityRatios } from '../lib/calculations'
import { useNavigate } from 'react-router-dom'

export default function Trends() {
  const data = useStore(s => s.data)
  const hasData = useStore(s => s.hasData)
  const navigate = useNavigate()
  if (!hasData || data.years.length < 2) {
    return (
      <EmptyState
        title="Need at least two years of data"
        detail="Trend charts require multiple financial years. Add another year's column in Review Data."
        action={<button onClick={() => navigate('/review')} className="mt-4 bg-navy text-white px-4 py-2 rounded-sm text-sm">Go to Review Data</button>}
      />
    )
  }

  const rows = data.years.map(y => ({
    year: y,
    revenue: getValue(data, 'revenue', y),
    ebitda: getValue(data, 'ebitda', y),
    pat: getValue(data, 'pat', y),
    ebitdaMargin: profitabilityRatios(data, y).ebitdaMargin,
    netMargin: profitabilityRatios(data, y).netProfitMargin,
    roe: profitabilityRatios(data, y).roe,
    cfo: getValue(data, 'cfo', y),
    debt: getValue(data, 'total_debt', y),
    cash: getValue(data, 'cash', y),
  }))

  return (
    <div>
      <SectionHeader title="Trend Analysis" description={`${data.years.length}-year view across ${data.years[0]}–${data.years[data.years.length - 1]}.`} />

      <ChartCard title="Revenue, EBITDA & PAT">
        <LineChart data={rows}>
          <CartesianGrid stroke="#D8D9D3" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#142441" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="ebitda" stroke="#2F6F62" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="pat" stroke="#B8860B" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Margins (%)">
        <LineChart data={rows}>
          <CartesianGrid stroke="#D8D9D3" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ebitdaMargin" name="EBITDA Margin" stroke="#2F6F62" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="netMargin" name="Net Margin" stroke="#B8860B" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>

      <ChartCard title="ROE (%)">
        <LineChart data={rows}>
          <CartesianGrid stroke="#D8D9D3" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="roe" stroke="#142441" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Debt vs Cash">
        <LineChart data={rows}>
          <CartesianGrid stroke="#D8D9D3" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="debt" stroke="#A23B3B" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cash" stroke="#2F6F62" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Operating Cash Flow">
        <LineChart data={rows}>
          <CartesianGrid stroke="#D8D9D3" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="cfo" stroke="#142441" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="ledger-card dir-flat mb-6">
      <div className="text-sm mb-2">{title}</div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  )
}
