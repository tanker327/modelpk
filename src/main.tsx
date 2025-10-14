import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EcosystemProvider } from '@zedux/react'
import './index.css'
import App from './App.tsx'
import { ecosystem } from './state/ecosystem'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <EcosystemProvider ecosystem={ecosystem}>
        <App />
      </EcosystemProvider>
    </BrowserRouter>
  </StrictMode>,
)
