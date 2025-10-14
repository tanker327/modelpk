import { Routes, Route, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ConfigPage from '@/pages/ConfigPage'

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Racers</h1>

        <div className="space-y-2">
          <p className="text-lg text-gray-600">
            Compare LLM models side by side
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/config">
            <Button>Configure Providers</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/config" element={<ConfigPage />} />
    </Routes>
  )
}

export default App
