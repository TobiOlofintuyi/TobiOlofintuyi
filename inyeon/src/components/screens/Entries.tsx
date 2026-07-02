import { s } from '../../css'
import { TabBar } from '../TabBar'
import type { Vals } from '../types'

export function Entries({ v }: { v: Vals }) {
  return (
    <div style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4;')}>
      <div className="scroll-y" style={s('position:absolute; inset:0; padding:18px 22px 96px;')}>
        <div style={s("display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#908A80; margin-bottom:16px;")}>
          <span>21:41</span>
          <span style={s('letter-spacing:.08em;')}>inyeon</span>
        </div>
        <h2 style={s("font-family:'Source Serif 4',serif; font-size:24px; letter-spacing:-.015em; color:#1A1816; margin:0 0 12px;")}>Entries</h2>
        <div style={s('display:flex; align-items:center; gap:9px; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:12px; padding:5px 13px; margin-bottom:10px;')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={s('stroke:#A8A095; stroke-width:2; stroke-linecap:round;')} aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
          <input value={v.entQ} onChange={v.onEntQ} placeholder="Search your words…" aria-label="Search your words" style={s("flex:1; border:none; background:none; outline:none; padding:6px 0; font-family:'Outfit',sans-serif; font-size:14px; color:#3A352F;")} />
        </div>
        <div style={s('display:flex; gap:8px; margin-bottom:16px;')}>
          <button onClick={v.onFilterNew} style={s(`font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em; padding:7px 14px; border-radius:999px; cursor:pointer; background:${v.fNewBg}; color:${v.fNewCol}; border:${v.fNewBd};`)}>Newest</button>
          <button onClick={v.onFilterHeld} style={s(`font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em; padding:7px 14px; border-radius:999px; cursor:pointer; background:${v.fHeldBg}; color:${v.fHeldCol}; border:${v.fHeldBd};`)}>Held</button>
        </div>
        {v.entCards.map((c: Vals) => (
          <div key={c.key}>
            {c.showMonth && (
              <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.18em; text-transform:uppercase; color:#B0A696; margin:4px 0 8px;")}>{c.month}</div>
            )}
            <div style={s('position:relative; background:#FFFFFF; border:1px solid #E4DFD5; border-radius:16px; padding:13px 16px 11px; margin-bottom:10px;')}>
              <span style={s(`position:absolute; top:0; right:0; width:0; height:0; border-left:22px solid transparent; border-top:22px solid ${c.fold};`)} />
              <div style={s('display:flex; align-items:baseline; gap:10px; margin-bottom:5px;')}>
                <span style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:#908A80;")}>{c.date}</span>
                <span style={s("margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:#B0A696;")}>{c.dur}</span>
                <button onClick={c.onHold} style={s(`background:none; border:none; cursor:pointer; padding:0; font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.08em; text-transform:uppercase; color:${c.holdCol};`)}>{c.holdLabel}</button>
              </div>
              <button onClick={c.onOpen} style={s('display:block; width:100%; text-align:left; background:none; border:none; padding:0; cursor:pointer;')}>
                <p style={s("font-family:'Source Serif 4',serif; font-size:15px; line-height:1.5; color:#3A352F; margin:0;")}>{c.text}</p>
              </button>
              <div style={s('display:flex; gap:6px; margin-top:8px;')}>
                <span style={s("font-family:'Outfit',sans-serif; font-size:12px; padding:3px 10px; border-radius:999px; background:#FFFFFF; color:#4A4540; border:1px solid #DDD9D0;")}>{c.chipA}</span>
                <span style={s("font-family:'Outfit',sans-serif; font-size:12px; padding:3px 10px; border-radius:999px; background:#FFFFFF; color:#4A4540; border:1px solid #DDD9D0;")}>{c.chipB}</span>
              </div>
            </div>
          </div>
        ))}
        {v.entEmpty && (
          <div style={s("text-align:center; padding:22px 0 8px; font-family:'Source Serif 4',serif; font-style:italic; font-size:13.5px; color:#A0968A;")}>Nothing here matches yet.</div>
        )}
        <div style={s("text-align:center; font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; color:#B0A696; margin-top:6px;")}>Hold an entry to keep it close. The fold marks the ones you have held.</div>
      </div>
      <TabBar v={v} variant="light" active="entries" pos="position:absolute; left:22px; right:22px; bottom:20px;" />
    </div>
  )
}
