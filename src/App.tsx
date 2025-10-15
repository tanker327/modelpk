import { Routes, Route } from 'react-router-dom'
import ComparisonPage from '@/pages/ComparisonPage'
import ConfigPage from '@/pages/ConfigPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ComparisonPage />} />
      <Route path="/config" element={<ConfigPage />} />
    </Routes>
  )
}

export default App
