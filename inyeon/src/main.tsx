import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'
import { logic, type State } from './logic'
import { loadState } from './persist'
import { applyTheme, initAmbientPause, initInstallPrompt, initServiceWorker } from './pwa'

async function boot() {
  // Offline-first: hydrate from on-device storage before the first paint.
  const saved = await loadState<Partial<State>>()
  logic.hydrate(saved)

  applyTheme(logic.state.theme)
  logic.subscribe(() => applyTheme(logic.state.theme))

  initAmbientPause()
  initInstallPrompt()
  initServiceWorker()

  const root = createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

void boot()
