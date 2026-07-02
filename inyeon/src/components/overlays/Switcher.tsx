import { useEffect, useRef } from 'react'
import { s } from '../../css'
import type { Vals } from '../types'

// The app switcher — every part of Inyeon, one sheet. Sections that predate
// the redesign live here in the redesigned voice; the Builder group appears
// only when builder mode is on (Settings → Builder).

function Icon({ kind }: { kind: string }) {
  const c = '#8A5A30'
  const round = s(`stroke:${c}; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round`)
  switch (kind) {
    case 'journal':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><line x1="12" y1="18" x2="12" y2="21" />
        </svg>
      )
    case 'todos':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <path d="M4 6.5l1.6 1.6L8.6 5" /><line x1="12" y1="6.5" x2="20" y2="6.5" />
          <path d="M4 13.5l1.6 1.6L8.6 12" /><line x1="12" y1="13.5" x2="20" y2="13.5" />
          <circle cx="5.6" cy="19.5" r="1.6" /><line x1="12" y1="19.5" x2="17" y2="19.5" />
        </svg>
      )
    case 'intentions':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 17v-5" /><path d="M12 12c0-2.6 2-4 4.4-4C16.4 10.6 14.6 12 12 12z" />
        </svg>
      )
    case 'patterns':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <path d="M3 12h4l2.4-6 4 12 2.4-6H21" />
        </svg>
      )
    case 'insight':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <path d="M12 21V9" /><path d="M12 13L7.5 8.5" /><path d="M12 9L16.5 4.5" />
          <circle cx="7.5" cy="8.5" r="1.4" fill={c} stroke="none" /><circle cx="16.5" cy="4.5" r="1.4" fill={c} stroke="none" />
        </svg>
      )
    case 'people':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.7-3 2.9-4.6 5.5-4.6s4.8 1.6 5.5 4.6" />
          <circle cx="16.8" cy="9.5" r="2.4" /><path d="M15.4 14.6c2.5-.4 4.6 1 5.3 3.6" />
        </svg>
      )
    case 'explorer':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <path d="M12 20s-7-4.6-9-9c-1.2-2.7.5-6 3.8-6 2 0 3.4 1.1 5.2 3.1C13.8 6.1 15.2 5 17.2 5c3.3 0 5 3.3 3.8 6-2 4.4-9 9-9 9z" />
        </svg>
      )
    case 'witness':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <path d="M4 13h4l2 3h4l2-3h4" /><path d="M4 13V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6" /><path d="M4 13v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
        </svg>
      )
    case 'mailbox':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" />
        </svg>
      )
    case 'backroom':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <rect x="9.5" y="3" width="5" height="5" rx="1.2" /><rect x="3" y="16" width="5" height="5" rx="1.2" /><rect x="16" y="16" width="5" height="5" rx="1.2" />
          <path d="M12 8v4M12 12l-6.5 4M12 12l6.5 4" />
        </svg>
      )
    case 'chair':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <path d="M3 21h18" /><path d="M5 21V10M9.7 21V10M14.3 21V10M19 21V10" /><path d="M3 10h18L12 3z" />
        </svg>
      )
    default:
      // provenance
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
          <circle cx="6.5" cy="5.5" r="2.2" /><circle cx="6.5" cy="18.5" r="2.2" /><circle cx="17.5" cy="11" r="2.2" />
          <path d="M6.5 7.7v8.6" /><path d="M6.5 12c0-3 3-3.5 8.8-3.6" style={s('stroke-dasharray:2 3;')} />
        </svg>
      )
  }
}

export function Switcher({ v }: { v: Vals }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    sheetRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') v.onSwitcherClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      onClick={v.onSwitcherClose}
      style={s(`position:absolute; inset:0; z-index:60; display:flex; align-items:flex-end; justify-content:center; padding:12px; background:${v.th.scrim2}; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:fade .3s ease;`)}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Everything in Inyeon"
        tabIndex={-1}
        onClick={v.stopEv}
        className="scroll-y"
        style={s('width:100%; max-height:88%; background:#F8F7F4; border:1px solid #E4DFD5; border-radius:22px; padding:12px 14px 14px; box-shadow:0 40px 90px -30px rgba(0,0,0,.7); animation:rise .4s cubic-bezier(.2,.7,.3,1) both; outline:none;')}
      >
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;')}>
          <span style={s('width:34px; height:4px; border-radius:999px; background:#D8D2C6;')} />
          <button onClick={v.onSwitcherClose} className="hit" aria-label="Close" style={s("background:none; border:none; cursor:pointer; color:#A8A095; font-family:'IBM Plex Mono',monospace; font-size:15px; line-height:1; padding:2px 4px;")}>×</button>
        </div>
        {v.switcherGroups.map((g: Vals) => (
          <div key={g.key}>
            <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:${g.key === 'builder' ? '#8A5A30' : '#908A80'}; margin:12px 4px 7px;`)}>
              {g.label}
              {g.key === 'builder' && <span style={s('display:inline-block; width:6px; height:6px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 6px rgba(232,166,96,.55); margin-left:7px; vertical-align:1px;')} />}
            </div>
            {g.items.map((it: Vals) => (
              <button
                key={it.key}
                onClick={it.onTap}
                aria-current={it.active ? 'page' : undefined}
                style={s(`display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:9px 10px; border-radius:14px; cursor:pointer; background:${it.active ? '#EFE8DD' : 'none'}; border:1px solid ${it.active ? '#E0D4BF' : 'transparent'}; margin-bottom:2px;`)}
              >
                <span style={s('display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:50%; background:#EFE6D8; flex:none;')}>
                  <Icon kind={it.key} />
                </span>
                <span style={s('display:flex; flex-direction:column; gap:1px; min-width:0;')}>
                  <span style={s("font-family:'Source Serif 4',serif; font-size:15px; color:#1A1816;")}>{it.label}</span>
                  <span style={s("font-family:'Outfit',sans-serif; font-size:11.5px; line-height:1.35; color:#A0968A;")}>{it.sub}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
        <div style={s("text-align:center; font-family:'Source Serif 4',serif; font-style:italic; font-size:12px; color:#B0A696; margin-top:10px;")}>Everything in Inyeon, one thread.</div>
      </div>
    </div>
  )
}
