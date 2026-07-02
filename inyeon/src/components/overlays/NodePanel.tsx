import { useEffect, useRef } from 'react'
import { s } from '../../css'
import type { Vals } from '../types'

export function NodePanel({ v }: { v: Vals }) {
  const p = v.panel
  const cardRef = useRef<HTMLDivElement>(null)
  const th = v.th

  // Overlays trap focus and Escape / Back always closes (Handoff §04).
  useEffect(() => {
    cardRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p])

  return (
    <div onClick={p.onClose} style={s(`position:absolute; inset:0; z-index:40; display:flex; align-items:center; justify-content:center; padding:22px; background:${th.scrim}; backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); animation:fade .35s ease;`)}>
      <div
        ref={cardRef}
        onClick={p.stop}
        role="dialog"
        aria-modal="true"
        aria-label={p.eyebrow}
        tabIndex={-1}
        className="scroll-y"
        style={s(`width:100%; max-width:304px; max-height:92%; background:${th.panelBg}; border:1px solid ${th.panelBd}; border-radius:22px; padding:26px 24px 24px; box-shadow:0 40px 90px -30px rgba(0,0,0,.75); animation:rise .4s cubic-bezier(.2,.7,.3,1) both; outline:none;`)}
      >
        <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:${th.pT3}; margin-bottom:14px;`)}>{p.eyebrow}</div>
        <p style={s(`font-family:'Source Serif 4',serif; font-style:italic; font-size:19px; line-height:1.4; color:${th.pT1}; margin:0 0 20px; letter-spacing:.002em;`)}>“{p.body}”</p>
        <div style={s(`padding:17px 0 2px; border-top:1px solid ${th.chipBd};`)}>
          <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.16em; text-transform:uppercase; color:${th.t3}; margin-bottom:9px;`)}>{p.qLabel}</div>
          <p style={s(`font-family:'Source Serif 4',serif; font-size:16px; line-height:1.5; color:${th.pT2}; margin:0 0 8px;`)}>{p.question}</p>
          <div style={s(`font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; line-height:1.42; color:${th.t3}; margin:0 0 18px;`)}>{p.statusLine}</div>
        </div>
        <div style={s('display:flex; flex-wrap:wrap; gap:9px;')}>
          {p.actions.map((a: Vals, i: number) => (
            <button key={i} onClick={a.onTap} style={s(`font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em; padding:9px 15px; border-radius:999px; cursor:pointer; background:${a.bg}; color:${a.fg}; border:1px solid ${a.bd}; transition:all .2s ease;`)}>{a.label}</button>
          ))}
        </div>
        {p.hasEv && (
          <div style={s(`margin-top:18px; padding-top:15px; border-top:1px solid ${th.chipBd};`)}>
            <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; color:${th.t3}; text-align:center; line-height:1.5;`)}>{p.evCaption}</div>
            <div style={s('position:relative; width:150px; height:150px; margin:8px auto 0;')}>
              <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" style={s('position:absolute; inset:0; width:100%; height:100%; overflow:visible;')} aria-hidden="true">
                <path d={p.miniPath} style={s(`fill:none; stroke:${p.miniStroke}; stroke-width:11; stroke-linecap:round; stroke-linejoin:round; opacity:.4;`)} />
              </svg>
              <div style={s(`position:absolute; left:${p.rootX}%; top:${p.rootY}%; transform:translate(-50%,-50%); width:11px; height:11px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 12px rgba(240,190,120,.6);`)} />
              {p.evNodes.map((ev: Vals) => (
                <button key={ev.key} onClick={ev.onTap} aria-label="Open the source of this evidence" style={s(`position:absolute; left:${ev.x}%; top:${ev.y}%; transform:translate(-50%,-50%); width:32px; height:32px; display:flex; align-items:center; justify-content:center; background:none; border:none; padding:0; cursor:pointer;`)}>
                  <span style={s(`width:12px; height:12px; border-radius:50%; background:${ev.dot}; border:${ev.ring}; box-shadow:0 0 10px rgba(232,166,96,.5); animation:glow 7s ease-in-out infinite;`)} />
                </button>
              ))}
            </div>
            <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:${th.t4}; text-align:center; margin-top:2px;`)}>Tap a light to open that entry</div>
          </div>
        )}
      </div>
    </div>
  )
}
