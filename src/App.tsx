import { Routes, Route } from 'react-router-dom'
import ComparisonPage from '@/pages/ComparisonPage'
import ConfigPage from '@/pages/ConfigPage'
import { PricingPage } from '@/pages/PricingPage'
import IntroPage from '@/pages/IntroPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/pk" element={<ComparisonPage />} />
      <Route path="/config" element={<ConfigPage />} />
      <Route path="/pricing" element={<PricingPage />} />
    </Routes>
  )
}

export default App
