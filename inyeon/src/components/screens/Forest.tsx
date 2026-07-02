import { s } from '../../css'
import { TabBar } from '../TabBar'
import type { Vals } from '../types'

export function Forest({ v }: { v: Vals }) {
  const th = v.th
  return (
    <div style={s('position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:58px 22px 96px;')}>
      <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.2em; text-transform:uppercase; color:${th.t3}; margin-bottom:7px;`)}>Your intentions</div>
      <div style={s(`font-family:'Source Serif 4',serif; font-style:italic; font-size:15px; color:${th.t2}; margin-bottom:26px; text-align:center; max-width:30ch; line-height:1.4;`)}>Each intention grows in a fractal form. Step into one.</div>
      <div style={s('display:flex; flex-direction:column; gap:16px; align-items:flex-start;')}>
        {v.forest.map((g: Vals) => (
          <button key={g.key} onClick={g.onEnter} style={s('display:flex; align-items:center; gap:14px; background:none; border:none; cursor:pointer; padding:0; text-align:left;')}>
            <div style={s('position:relative; width:126px; height:126px; flex:none;')}>
              <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" style={s('position:absolute; inset:0; width:100%; height:100%; overflow:visible;')} aria-hidden="true">
                <path d={g.miniPath} style={s(`fill:none; stroke:${g.miniStroke}; stroke-width:11; stroke-linecap:round; stroke-linejoin:round; opacity:.5;`)} />
              </svg>
              <div style={s(`position:absolute; left:${g.rootX}%; top:${g.rootY}%; transform:translate(-50%,-50%); width:50px; height:50px; border-radius:50%; background:${g.centerGlow};`)} />
              <div style={s(`position:absolute; left:${g.rootX}%; top:${g.rootY}%; transform:translate(-50%,-50%); width:7px; height:7px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 10px rgba(240,190,120,.5);`)} />
              {g.dots.map((d: Vals) => (
                <span key={d.key} style={s(`position:absolute; left:${d.x}%; top:${d.y}%; transform:translate(-50%,-50%); width:${d.size}px; height:${d.size}px; border-radius:50%; background:${d.c}; box-shadow:${d.shadow}; opacity:${d.op}; animation:${d.anim};`)} />
              ))}
            </div>
            <div style={s('display:flex; flex-direction:column; gap:5px; max-width:146px;')}>
              <div style={s(`font-family:'Source Serif 4',serif; font-size:15px; line-height:1.26; color:${th.fLabel};`)}>{g.label}</div>
              <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.13em; text-transform:uppercase; color:${g.stageColor};`)}>{g.formLabel} · {g.stage}</div>
            </div>
          </button>
        ))}
      </div>
      <TabBar v={v} variant="landscape" active="insights" pos="position:absolute; left:22px; right:22px; bottom:20px;" />
    </div>
  )
}
