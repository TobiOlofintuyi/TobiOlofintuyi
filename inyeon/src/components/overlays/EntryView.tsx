import { s } from '../../css'
import type { Vals } from '../types'

// A source entry / reflection, opened from a light in the landscape or a chip.
export function EntryView({ v }: { v: Vals }) {
  const e = v.entry
  const th = v.th
  return (
    <div onClick={e.onClose} style={s(`position:absolute; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; padding:22px; background:${th.scrim2}; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:fade .35s ease;`)}>
      <div onClick={e.stop} role="dialog" aria-modal="true" aria-label={e.eyebrow} style={s('width:100%; max-width:308px; background:linear-gradient(180deg, #F8F4EC, #F1EADD); border:1px solid #E0D8C8; border-radius:22px; padding:24px 24px 22px; box-shadow:0 40px 90px -30px rgba(0,0,0,.7); animation:rise .4s cubic-bezier(.2,.7,.3,1) both;')}>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:15px;')}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#8A5A30;")}>{e.eyebrow} · {e.date}</div>
          <button onClick={e.onClose} aria-label="Close" style={s("background:none; border:none; cursor:pointer; color:#A8A095; font-family:'IBM Plex Mono',monospace; font-size:14px; line-height:1; padding:0;")}>×</button>
        </div>
        <p style={s("font-family:'Source Serif 4',serif; font-size:15.5px; line-height:1.62; color:#3A352F; margin:0 0 20px;")}>{e.before}<span style={s('background:rgba(200,138,62,.22); border-radius:3px; padding:0 2px;')}>{e.phrase}</span>{e.after}</p>
        <div style={s('display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid #E4DFD5;')}>
          <button onClick={e.onClose} style={s(`background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.05em; color:${e.backCol}; white-space:nowrap;`)}>← {e.backLabel}</button>
          {e.canOpen && (
            <button onClick={e.onOpenFull} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.05em; color:#8A5A30; border-bottom:1px solid #8A5A30; white-space:nowrap;")}>Open this entry →</button>
          )}
          {e.noOpen && (
            <span style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.05em; color:#B0A696;")}>{e.footer}</span>
          )}
        </div>
      </div>
    </div>
  )
}
