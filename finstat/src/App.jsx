import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import ReviewData from './pages/ReviewData'
import Statements from './pages/Statements'
import Profitability from './pages/Profitability'
import Liquidity from './pages/Liquidity'
import Solvency from './pages/Solvency'
import Efficiency from './pages/Efficiency'
import CashFlow from './pages/CashFlow'
import Growth from './pages/Growth'
import DuPont from './pages/DuPont'
import CommonSize from './pages/CommonSize'
import Trends from './pages/Trends'
import RedFlags from './pages/RedFlags'
import AiAnalystPage from './pages/AiAnalyst'
import Scenario from './pages/Scenario'
import Report from './pages/Report'
import Validation from './pages/Validation'
import Methodology from './pages/Methodology'

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/review" element={<ReviewData />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/profitability" element={<Profitability />} />
          <Route path="/liquidity" element={<Liquidity />} />
          <Route path="/solvency" element={<Solvency />} />
          <Route path="/efficiency" element={<Efficiency />} />
          <Route path="/cashflow" element={<CashFlow />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/dupont" element={<DuPont />} />
          <Route path="/common-size" element={<CommonSize />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/red-flags" element={<RedFlags />} />
          <Route path="/ai-analyst" element={<AiAnalystPage />} />
          <Route path="/scenario" element={<Scenario />} />
          <Route path="/report" element={<Report />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/methodology" element={<Methodology />} />
        </Routes>
      </main>
    </div>
  )
}
