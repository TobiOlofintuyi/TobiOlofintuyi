import { s } from '../../css'
import type { Vals } from '../types'

// Post-journal breath, while the mirror is readied. Under prefers-reduced-motion
// the deepbreath ring becomes a still ring and the "in · and out" text carries
// the pacing (handled by the reduced-motion rules in styles.css).
export function Breath({ v }: { v: Vals }) {
  const th = v.th
  return (
    <div style={s(`position:absolute; inset:0; z-index:30; background:${th.scrBg}; padding:22px 26px 30px; display:flex; flex-direction:column; align-items:center;`)}>
      <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:${th.t4}; margin:20px 0 0;`)}>Your words are settling</div>
      <div style={s('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;')}>
        <div style={s('width:250px; height:250px; border-radius:50%; background:radial-gradient(circle, rgba(240,196,126,.28), rgba(240,196,126,0) 70%); display:flex; align-items:center; justify-content:center; animation:deepbreath 8s ease-in-out infinite; margin-bottom:8px;')}>
          <div style={s('width:16px; height:16px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 24px rgba(240,190,120,.6);')} />
        </div>
        <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.3em; text-transform:uppercase; color:${th.t3}; margin-bottom:22px;`)}>in · and out</div>
        <div style={s(`font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; color:${th.t3}; text-align:center;`)}>Five breaths, or as long as you like.<br />Your reflection will be ready.</div>
      </div>
      <button onClick={v.nav.breathDone} style={s(`margin-bottom:22px; background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:${th.optHd}; border-bottom:1px solid ${th.optBd}; padding:0 0 1px;`)}>Open your reflection</button>
    </div>
  )
}
