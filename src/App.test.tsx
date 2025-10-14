import { render, screen } from '@testing-library/react'
import { EcosystemProvider } from '@zedux/react'
import { ecosystem } from '@/state/ecosystem'
import App from './App'

describe('App', () => {
  it('renders greeting from Zedux atom', () => {
    render(
      <EcosystemProvider ecosystem={ecosystem}>
        <App />
      </EcosystemProvider>
    )

    expect(screen.getByText(/Hello, AI Racers!/i)).toBeInTheDocument()
  })

  it('shows all libraries are working message', () => {
    render(
      <EcosystemProvider ecosystem={ecosystem}>
        <App />
      </EcosystemProvider>
    )

    expect(screen.getByText(/All libraries are working!/i)).toBeInTheDocument()
  })

  it('renders test button', () => {
    render(
      <EcosystemProvider ecosystem={ecosystem}>
        <App />
      </EcosystemProvider>
    )

    const button = screen.getByRole('button', { name: /Test Button/i })
    expect(button).toBeInTheDocument()
  })
})
