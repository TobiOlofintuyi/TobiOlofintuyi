import { useSyncExternalStore } from 'react'
import { logic } from './logic'
import type { Vals } from './components/types'

// Subscribes the component tree to the store and recomputes the render-values
// bag (a near-verbatim port of the design's renderVals()) on every change.
export function useVals(): Vals {
  useSyncExternalStore(logic.subscribe, logic.getSnapshot, logic.getSnapshot)
  return logic.renderVals()
}
