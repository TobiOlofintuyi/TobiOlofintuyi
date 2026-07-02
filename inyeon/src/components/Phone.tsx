import { useVals } from '../store'
import { s } from '../css'
import { Onboarding } from './screens/Onboarding'
import { Breath } from './screens/Breath'
import { Speak } from './screens/Speak'
import { Entries } from './screens/Entries'
import { Settings } from './screens/Settings'
import { Detail } from './screens/Detail'
import { Forest } from './screens/Forest'
import { Landscape } from './screens/Landscape'
import { NodePanel } from './overlays/NodePanel'
import { Compose } from './overlays/Compose'
import { EntryView } from './overlays/EntryView'

export function Phone({ bezel }: { bezel: boolean }) {
  const v = useVals()
  const th = v.th

  const screen = (
    <div style={s(`position:relative; width:370px; height:800px; border-radius:${bezel ? 36 : 34}px; overflow:hidden; background:${th.scrBg};`)}>
      {/* ambient motes — pause when the tab is hidden (see styles.css) */}
      <div style={s('position:absolute; top:20%; left:14%; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle, rgba(150,110,64,.11), transparent 68%); filter:blur(8px); animation:drift 22s ease-in-out infinite; pointer-events:none;')} />
      <div style={s('position:absolute; top:60%; left:66%; width:240px; height:240px; border-radius:50%; background:radial-gradient(circle, rgba(120,92,58,.10), transparent 68%); filter:blur(10px); animation:drift 30s ease-in-out infinite reverse; pointer-events:none;')} />

      {/* base status bar (visible on the landscape/forest surfaces) */}
      <div style={s(`position:absolute; top:0; left:0; right:0; z-index:22; display:flex; justify-content:space-between; align-items:center; padding:14px 24px 0; font-family:'IBM Plex Mono',monospace; font-size:11px; color:${th.status}; pointer-events:none;`)}>
        <span>9:41</span>
        <span style={s('display:flex; align-items:center; gap:6px;')}>
          <span style={s('width:4px; height:4px; border-radius:50%; background:#7A6248;')} />
          <span style={s('width:4px; height:4px; border-radius:50%; background:#7A6248;')} />
          <span style={s('letter-spacing:.08em;')}>inyeon</span>
        </span>
      </div>

      {/* insights base surface */}
      <Landscape v={v} />
      {v.forestMode && <Forest v={v} />}

      {/* opaque screens (z-30) */}
      <Onboarding v={v} />
      {v.breathMode && <Breath v={v} />}
      {v.speakMode && <Speak v={v} />}
      {v.entriesMode && <Entries v={v} />}
      {v.settingsMode && <Settings v={v} />}
      {v.detailMode && <Detail v={v} />}

      {/* overlays */}
      {v.panelOpen && <NodePanel v={v} />}
      {v.composeOpen && <Compose v={v} />}
      {v.entryPanelOpen && <EntryView v={v} />}
    </div>
  )

  if (!bezel) return screen
  return (
    <div style={s('width:396px; background:#EFE8DD; border:1px solid #DDD9D0; border-radius:48px; padding:13px; box-shadow:0 40px 80px -38px rgba(40,32,24,.55);')}>
      {screen}
    </div>
  )
}
