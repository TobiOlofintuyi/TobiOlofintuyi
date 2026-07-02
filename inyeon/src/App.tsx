import { useEffect, useState } from 'react'
import { Phone } from './components/Phone'

// The app is a fixed 370×800 surface (the design's coordinate system). We scale
// it to fit any viewport — a framed device on desktop, edge-to-edge when
// installed/standalone or on a phone — so absolute positioning stays faithful.
const SCREEN_W = 370
const SCREEN_H = 800
const PAD = 13

function isStandalone(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    )
  } catch {
    return false
  }
}

function compute(): { bezel: boolean; scale: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const bezel = !isStandalone() && vw >= 480 && vh >= 620
  const fw = bezel ? SCREEN_W + PAD * 2 : SCREEN_W
  const fh = bezel ? SCREEN_H + PAD * 2 : SCREEN_H
  const margin = bezel ? 48 : 0
  const scale = Math.min((vw - margin) / fw, (vh - margin) / fh)
  return { bezel, scale }
}

export function App() {
  const [layout, setLayout] = useState(compute)
  useEffect(() => {
    const on = () => setLayout(compute())
    window.addEventListener('resize', on)
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener?.('change', on)
    return () => {
      window.removeEventListener('resize', on)
      mq.removeEventListener?.('change', on)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${layout.scale})`, transformOrigin: 'center center' }}>
        <Phone bezel={layout.bezel} />
      </div>
    </div>
  )
}
