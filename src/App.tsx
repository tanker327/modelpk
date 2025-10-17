import { Routes, Route } from 'react-router-dom'
import ComparisonPage from '@/pages/ComparisonPage'
import ConfigPage from '@/pages/ConfigPage'
import { PricingPage } from '@/pages/PricingPage'
import IntroPage from '@/pages/IntroPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ComparisonPage />} />
      <Route path="/intro" element={<IntroPage />} />
      <Route path="/config" element={<ConfigPage />} />
      <Route path="/pricing" element={<PricingPage />} />
    </Routes>
  )
}

export default App
