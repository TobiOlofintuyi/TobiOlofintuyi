import { s } from '../../css'
import { TabBar } from '../TabBar'
import type { Vals } from '../types'

// Journal home. Blank surface: date + question + mic light, or write instead.
export function Speak({ v }: { v: Vals }) {
  return (
    <div style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4; padding:18px 24px 24px; display:flex; flex-direction:column;')}>
      <div style={s("display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#908A80; margin-bottom:18px;")}>
        <span>21:41</span>
        <span style={s('letter-spacing:.08em;')}>inyeon</span>
      </div>

      <div style={s('display:flex; flex-direction:column; align-items:center; text-align:center; gap:7px; margin-top:6px;')}>
        <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:#908A80;")}>Wednesday, July 1</div>
        <div style={s("font-family:'Source Serif 4',serif; font-size:20px; line-height:1.4; color:#1A1816; max-width:22ch;")}>What is on your mind right now?</div>
        <div style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:13.5px; color:#A0968A;")}>{v.speakHint}</div>
      </div>

      {v.speakVoiceShow && (
        <div style={s('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;')}>
          <button onClick={v.nav.breathToDetail} aria-label="Tap to begin speaking" style={s('position:relative; display:flex; align-items:center; justify-content:center; width:76px; height:76px; background:none; border:none; cursor:pointer; padding:0;')}>
            <span style={s('position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle, rgba(240,196,126,.30), rgba(240,196,126,0) 70%); animation:breath 4.6s ease-in-out infinite;')} />
            <span style={s('position:absolute; inset:11px; border-radius:50%; border:1px solid rgba(198,138,62,.45);')} />
            <span style={s('width:13px; height:13px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 16px rgba(240,190,120,.65);')} />
          </button>
          <span style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#9A8358;")}>Tap to begin</span>
          <button onClick={v.onWriteInstead} style={s("margin-top:4px; background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; color:#A8A095; border-bottom:1px solid #D8D2C6; padding:0 0 1px;")}>Or write instead</button>
        </div>
      )}

      {v.speakWriting && (
        <div style={s('flex:1; display:flex; flex-direction:column; padding-top:16px;')}>
          <textarea value={v.speakText} onChange={v.onSpeakText} placeholder="Write what is on your mind…" style={s("flex:1; min-height:220px; resize:none; box-sizing:border-box; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:14px; padding:14px 15px; font-family:'Source Serif 4',serif; font-size:16px; line-height:1.6; color:#3A352F; outline:none;")} />
          <div style={s('display:flex; justify-content:space-between; align-items:center; margin:14px 0 16px;')}>
            <button onClick={v.onSpeakVoice} title="Speak instead" aria-label="Speak instead" style={s('display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#F3ECDF; border:1px solid #D8C9B2; border-radius:50%; cursor:pointer;')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={s('stroke:#8A5A30; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;')} aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><line x1="12" y1="18" x2="12" y2="21" /></svg>
            </button>
            <button onClick={v.nav.breathToDetail} style={s("background:#8A5A30; border:none; border-radius:999px; padding:11px 18px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.05em; color:#F8F4EC;")}>Save reflection</button>
          </div>
        </div>
      )}

      <TabBar v={v} variant="light" active="journal" />
    </div>
  )
}
