import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EcosystemProvider } from '@zedux/react'
import './index.css'
import App from './App.tsx'
import { ecosystem } from './state/ecosystem'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EcosystemProvider ecosystem={ecosystem}>
      <App />
    </EcosystemProvider>
  </StrictMode>,
)
