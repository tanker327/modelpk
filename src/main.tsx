import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EcosystemProvider } from '@zedux/react'
import './index.css'
import App from './App.tsx'
import { ecosystem } from './state/ecosystem'
import { logger } from './services/logger'

// Automatically detect base path from where index.html is loaded
// This allows the app to work at any URL depth (/, /modelpk/, /apps/modelpk/, etc.)
const getBasePath = () => {
  const base = document.querySelector('base')?.getAttribute('href')
  if (base) return base

  // Extract path from current location, removing trailing index.html
  const path = window.location.pathname.replace(/\/index\.html$/, '')
  // Return the directory path (everything up to the last /)
  return path.endsWith('/') ? path.slice(0, -1) : path.substring(0, path.lastIndexOf('/')) || '/'
}

const basename = getBasePath()
logger.info('Base path detected:', basename)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <EcosystemProvider ecosystem={ecosystem}>
        <App />
      </EcosystemProvider>
    </BrowserRouter>
  </StrictMode>,
)
