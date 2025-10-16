import { useState, useEffect } from 'react'

export function SecurityWarning() {
  const [isInsecure, setIsInsecure] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if running on HTTP (not HTTPS or localhost)
    const isHttp = window.location.protocol === 'http:'
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    if (isHttp && !isLocalhost) {
      setIsInsecure(true)
    }
  }, [])

  if (!isInsecure || isDismissed) {
    return null
  }

  return (
    <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 mb-4 rounded-r relative">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 text-orange-600 hover:text-orange-800 text-xl leading-none"
        title="Dismiss warning"
      >
        ×
      </button>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold">
            ⚠️ Insecure Connection (HTTP)
          </h3>
          <div className="mt-2 text-sm">
            <p className="mb-2">
              You're accessing this app over <strong>HTTP</strong> instead of <strong>HTTPS</strong>.
            </p>
            <p className="mb-2">
              <strong>Security implications:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>API keys are stored with <strong>base64 encoding only</strong> (not encrypted)</li>
              <li>Data transmitted to LLM providers is not encrypted by the browser</li>
              <li>Your API keys could be visible to network observers</li>
            </ul>
            <p className="mt-3 font-semibold">
              📌 <strong>Recommendation:</strong> Use HTTPS in production for proper encryption and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
