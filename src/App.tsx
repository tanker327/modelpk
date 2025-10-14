import { useAtomValue } from '@zedux/react'
import { Button } from '@/components/ui/button'
import { exampleAtom } from '@/state/atoms/exampleAtom'
import { validateExample } from '@/schemas/exampleSchema'

function App() {
  console.log('App component mounted')

  // Test Zedux atom
  const greeting = useAtomValue(exampleAtom, ['AI Racers'])
  console.log('Zedux greeting:', greeting)

  // Test Zod validation
  try {
    const validData = validateExample({ name: 'Test User', age: 25 })
    console.log('Zod validation successful:', validData)
  } catch (error) {
    console.error('Zod validation error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {greeting}
        </h1>

        <div className="space-y-2">
          <p className="text-lg text-gray-600">
            All libraries are working!
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>✅ Tailwind CSS - Styling</li>
            <li>✅ shadcn/ui - Components</li>
            <li>✅ Zedux - State Management</li>
            <li>✅ Zod - Schema Validation</li>
          </ul>
        </div>

        <Button onClick={() => console.log('Button clicked!')}>
          Test Button
        </Button>
      </div>
    </div>
  )
}

export default App
