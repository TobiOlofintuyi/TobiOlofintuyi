import { s } from '../../css'
import type { Vals } from '../types'

// "Note how it's going" — log a practice against an insight (distinct from
// Save reflection). Voice or text.
export function Compose({ v }: { v: Vals }) {
  const c = v.compose
  const th = v.th
  return (
    <div onClick={c.onCancel} style={s(`position:absolute; inset:0; z-index:46; display:flex; align-items:center; justify-content:center; padding:20px; background:${th.scrim2}; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); animation:fade .35s ease;`)}>
      <div onClick={c.stop} role="dialog" aria-modal="true" aria-label="Note how it’s going" style={s('width:100%; max-width:312px; background:linear-gradient(180deg,#F8F4EC,#F1EADD); border:1px solid #E0D8C8; border-radius:22px; padding:24px 22px 20px; box-shadow:0 40px 90px -30px rgba(0,0,0,.7); animation:rise .4s cubic-bezier(.2,.7,.3,1) both;')}>
        <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#8A5A30; margin-bottom:12px;")}>Note how it’s going</div>
        <div style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:13.5px; line-height:1.4; color:#8A8177; margin:0 0 6px;")}>On “{c.insightBody}”</div>
        <div style={s("font-family:'Source Serif 4',serif; font-size:15.5px; line-height:1.45; color:#3A352F; margin:0 0 14px;")}>{c.question}</div>
        <textarea value={c.text} onChange={c.onText} placeholder="How is the practice going?" style={s("width:100%; min-height:118px; resize:none; box-sizing:border-box; border:1px solid #E0D8C8; border-radius:12px; background:#FCFAF4; padding:12px 13px; font-family:'Source Serif 4',serif; font-size:15px; line-height:1.55; color:#3A352F; outline:none;")} />
        <div style={s('display:flex; justify-content:space-between; align-items:center; margin-top:14px;')}>
          <button onClick={c.onCancel} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.05em; color:#A8A095;")}>Cancel</button>
          <div style={s('display:flex; align-items:center; gap:10px;')}>
            <button onClick={c.onMic} title="Speak" aria-label="Speak" style={s(`display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:${c.micBg}; border:1px solid ${c.micBorder}; border-radius:50%; cursor:pointer; animation:${c.micAnim};`)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={s('stroke:#8A5A30; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;')} aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><line x1="12" y1="18" x2="12" y2="21" /></svg>
            </button>
            <button onClick={c.onSave} style={s("background:#8A5A30; border:none; border-radius:999px; padding:9px 16px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.05em; color:#F8F4EC;")}>Log this practice</button>
          </div>
        </div>
      </div>
    </div>
  )
}
