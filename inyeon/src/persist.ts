// Offline-first persistence. Per the handoff, entries, insights and settings
// live on-device in IndexedDB so the app opens with zero network. localStorage
// is kept as a synchronous companion store: it covers browsers/contexts where
// IndexedDB is blocked, and it makes the page-hide flush durable (an async
// IndexedDB write may not survive tab teardown). Writes are stamped and the
// newer of the two stores wins on load.

const DB_NAME = 'inyeon'
const STORE = 'kv'
const KEY = 'app-state'
const LS_KEY = 'inyeon:app-state'

interface Envelope {
  t: number
  v: unknown
}

function wrap(v: unknown): Envelope {
  return { t: Date.now(), v }
}

function isEnvelope(x: unknown): x is Envelope {
  return !!x && typeof x === 'object' && 't' in x && 'v' in x && typeof (x as Envelope).t === 'number'
}

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDB(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

async function readIdb(): Promise<Envelope | null> {
  const db = await openDB()
  if (!db) return null
  try {
    return await new Promise<Envelope | null>((resolve) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(isEnvelope(req.result) ? req.result : null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

function readLs(): Envelope | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isEnvelope(parsed) ? parsed : null
  } catch {
    return null
  }
}

export async function loadState<T = unknown>(): Promise<T | null> {
  const [idb, ls] = [await readIdb(), readLs()]
  const newest = !idb ? ls : !ls ? idb : idb.t >= ls.t ? idb : ls
  return (newest?.v as T) ?? null
}

async function writeState(env: Envelope): Promise<void> {
  const db = await openDB()
  let idbOk = false
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(env, KEY)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      idbOk = true
    } catch {
      /* fall through to localStorage */
    }
  }
  if (!idbOk) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(env))
    } catch {
      /* best effort */
    }
  }
}

let timer: ReturnType<typeof setTimeout> | null = null
let pending: Envelope | null = null

function flushPending(): void {
  if (!timer || !pending) return
  clearTimeout(timer)
  timer = null
  // Synchronous localStorage write first — it survives tab teardown. The
  // IndexedDB write follows best-effort; whichever lands newest wins on load.
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(pending))
  } catch {
    /* best effort */
  }
  void writeState(pending)
}

// Flush the debounce window when the tab is hidden or dismissed, so a change
// made just before closing/refreshing is never lost (offline-first discipline).
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushPending()
  })
  window.addEventListener('pagehide', flushPending)
}

// Debounced fire-and-forget save — coalesces bursts of setState into one write.
export function schedulePersist(data: unknown): void {
  pending = wrap(data)
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    if (pending) void writeState(pending)
  }, 250)
}

export async function clearState(): Promise<void> {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  pending = null
  const db = await openDB()
  if (db) {
    try {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).delete(KEY)
        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      })
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}
