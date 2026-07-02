import { registerSW } from 'virtual:pwa-register'

// PWA discipline (Optimization Handoff §05): register the offline shell,
// swap the meta theme-color per theme, capture the install prompt, and pause
// ambient motion when the tab is hidden.

export function initServiceWorker(): void {
  try {
    registerSW({ immediate: true })
  } catch {
    /* SW unsupported (e.g. non-secure context) — the app still runs online. */
  }
}

export function applyTheme(theme: 'dark' | 'light'): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const color = theme === 'dark' ? '#0C0906' : '#F8F7F4'
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = color
}

// --- install prompt (beforeinstallprompt) ---
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
let deferred: BeforeInstallPromptEvent | null = null

export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
  })
}

export function canInstall(): boolean {
  return !!deferred
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  try {
    await deferred.prompt()
    const choice = await deferred.userChoice
    deferred = null
    return choice.outcome === 'accepted'
  } catch {
    return false
  }
}

// Ambient animations (motes, sway, glow) pause when the tab is hidden.
export function initAmbientPause(): void {
  const apply = () => document.documentElement.classList.toggle('tab-hidden', document.hidden)
  document.addEventListener('visibilitychange', apply)
  apply()
}
