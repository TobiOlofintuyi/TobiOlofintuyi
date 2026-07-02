// Offline-first persistence. Per the handoff, entries, insights and settings
// live on-device in IndexedDB so the app opens with zero network. A small
// localStorage fallback covers browsers/contexts where IndexedDB is blocked.

const DB_NAME = 'inyeon'
const STORE = 'kv'
const KEY = 'app-state'
const LS_KEY = 'inyeon:app-state'

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

export async function loadState<T = unknown>(): Promise<T | null> {
  const db = await openDB()
  if (db) {
    try {
      return await new Promise<T | null>((resolve) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(KEY)
        req.onsuccess = () => resolve((req.result as T) ?? null)
        req.onerror = () => resolve(null)
      })
    } catch {
      /* fall through to localStorage */
    }
  }
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

async function writeState(data: unknown): Promise<void> {
  const db = await openDB()
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(data, KEY)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      return
    } catch {
      /* fall through to localStorage */
    }
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {
    /* best effort */
  }
}

let timer: ReturnType<typeof setTimeout> | null = null
let pending: unknown = null

// Debounced fire-and-forget save — coalesces bursts of setState into one write.
export function schedulePersist(data: unknown): void {
  pending = data
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    void writeState(pending)
  }, 250)
}

export async function clearState(): Promise<void> {
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
