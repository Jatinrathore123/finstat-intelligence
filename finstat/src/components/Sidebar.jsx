import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/upload', label: 'Upload' },
  { to: '/statements', label: 'Financial Statements' },
  { to: '/profitability', label: 'Profitability' },
  { to: '/liquidity', label: 'Liquidity' },
  { to: '/solvency', label: 'Solvency' },
  { to: '/efficiency', label: 'Efficiency' },
  { to: '/cashflow', label: 'Cash Flow' },
  { to: '/growth', label: 'Growth' },
  { to: '/dupont', label: 'DuPont' },
  { to: '/common-size', label: 'Common Size' },
  { to: '/trends', label: 'Trends' },
  { to: '/red-flags', label: 'Red Flags' },
  { to: '/ai-analyst', label: 'AI Analyst' },
  { to: '/scenario', label: 'Scenario Analysis' },
  { to: '/report', label: 'Reports' },
  { to: '/validation', label: 'Data Validation' },
  { to: '/methodology', label: 'Methodology' },
]

export default function Sidebar() {
  const companyName = useStore(s => s.data.meta.companyName)
  const hasData = useStore(s => s.hasData)

  return (
    <aside className="w-60 shrink-0 bg-navy text-white/90 min-h-screen flex flex-col no-print">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="font-display text-lg tracking-tight leading-tight">FinStat<br/>Intelligence</div>
        <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">Statement Analysis</div>
      </div>

      {hasData && (
        <div className="px-5 py-3 border-b border-white/10 text-sm">
          <div className="text-white/50 text-[11px] uppercase tracking-wide">Company</div>
          <div className="truncate">{companyName || 'Untitled company'}</div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block px-5 py-2 text-sm border-l-2 transition-colors ${
                isActive
                  ? 'border-ledger bg-white/5 text-white'
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40 leading-relaxed">
        Runs entirely in your browser.<br/>No data leaves your device unless you use AI Analyst.
      </div>
    </aside>
  )
}
