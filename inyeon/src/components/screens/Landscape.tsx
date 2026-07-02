import { s } from '../../css'
import { TabBar } from '../TabBar'
import type { Vals } from '../types'

const A11Y_STATE: Record<string, string> = { open: 'open', practice: 'in practice', integrated: 'settled' }

// The choosing ritual — shown when an intention has no held form yet.
function Choosing({ v }: { v: Vals }) {
  const th = v.th
  return (
    <div style={s('position:absolute; inset:0; z-index:18; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 30px;')}>
      <div style={s('width:74px; height:74px; border-radius:50%; background:radial-gradient(circle, rgba(240,196,126,.32), rgba(240,196,126,0) 70%); display:flex; align-items:center; justify-content:center; margin-bottom:24px; animation:glow 9s ease-in-out infinite;')}>
        <div style={s('width:12px; height:12px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 16px rgba(240,190,120,.6);')} />
      </div>
      <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:${th.t4}; margin-bottom:10px; text-align:center; max-width:26ch;`)}>{v.intentLabel}</div>
      <div style={s(`font-family:'Source Serif 4',serif; font-size:21px; line-height:1.34; color:${th.t1}; text-align:center; margin-bottom:30px; max-width:22ch;`)}>How would you like to move through your insights?</div>
      <div style={s('display:flex; flex-direction:column; gap:13px; width:100%; max-width:282px;')}>
        {v.choices.map((c: Vals) => (
          <button key={c.key} onClick={c.onTap} className="opt-card" style={s(`display:flex; flex-direction:column; gap:4px; align-items:flex-start; text-align:left; background:${th.optBg}; border:1px solid ${th.optBd}; border-radius:16px; padding:15px 18px; cursor:pointer;`)}>
            <span style={s(`font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:${th.optHd};`)}>{c.label}</span>
            <span style={s(`font-family:'Source Serif 4',serif; font-style:italic; font-size:14px; line-height:1.35; color:${th.t2};`)}>{c.hint}</span>
          </button>
        ))}
      </div>
      <button onClick={v.toForest} style={s(`margin-top:26px; display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:${th.t3};`)}><span style={s('font-size:12px;')}>←</span> the forest</button>
    </div>
  )
}

function Intention({ v }: { v: Vals }) {
  const th = v.th
  return (
    <>
      <div style={s('position:absolute; left:50%; top:50%; width:100%; aspect-ratio:1/1; transform:translate(-50%,-50%); overflow:visible;')}>
        <div style={s(`position:absolute; inset:0; animation:growin 1.2s cubic-bezier(.2,.7,.3,1) forwards; transform-origin:${v.originStr};`)}>
          <div onClick={v.onBgClick} style={s(`position:absolute; inset:0; animation:${v.groupAnim}; transform-origin:${v.originStr};`)}>
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" style={s(`position:absolute; inset:0; width:100%; height:100%; overflow:visible; opacity:${v.svgOpacity}; transition:opacity .5s ease; pointer-events:none;`)} aria-hidden="true">
              <path d={v.pThick} style={s(`fill:none; stroke:${v.auraCol}; stroke-width:${v.awThick}; stroke-linecap:round; stroke-linejoin:round; filter:blur(6px);`)} />
              <path d={v.pMid} style={s(`fill:none; stroke:${v.auraCol}; stroke-width:${v.awMid}; stroke-linecap:round; stroke-linejoin:round; filter:blur(4px);`)} />
              <path d={v.pThin} style={s(`fill:none; stroke:${v.auraCol}; stroke-width:${v.awThin}; stroke-linecap:round; stroke-linejoin:round; filter:blur(3px);`)} />
              <path d={v.pThick} style={s(`fill:none; stroke:${v.coreCol}; stroke-width:${v.wThick}; stroke-linecap:round; stroke-linejoin:round;`)} />
              <path d={v.pMid} style={s(`fill:none; stroke:${v.coreCol}; stroke-width:${v.wMid}; stroke-linecap:round; stroke-linejoin:round;`)} />
              <path d={v.pThin} style={s(`fill:none; stroke:${v.coreCol}; stroke-width:${v.wThin}; stroke-linecap:round; stroke-linejoin:round; opacity:.82;`)} />
              <path d={v.flowD} style={s(`fill:none; stroke:${v.flowStroke}; stroke-width:2.2; stroke-linecap:round; stroke-dasharray:2 15; animation:${v.flowAnim};`)} />
            </svg>

            <div style={s(`position:absolute; left:${v.center.leftPct}%; top:${v.center.topPct}%; transform:translate(-50%,-50%); width:96px; height:96px; border-radius:50%; background:radial-gradient(circle, rgba(240,196,126,.30), rgba(240,196,126,0) 70%); animation:glow 9s ease-in-out infinite; display:flex; align-items:center; justify-content:center; pointer-events:none;`)}>
              <div style={s('width:13px; height:13px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 16px rgba(240,190,120,.6);')} />
            </div>

            {v.nodes.map((n: Vals) => (
              <button key={n.key} onClick={n.onTap} onMouseEnter={n.onEnter} onMouseLeave={n.onLeave} aria-label={`${n.label} — ${A11Y_STATE[n.q] || 'open'}`} style={s(`position:absolute; left:${n.leftPct}%; top:${n.topPct}%; transform:translate(-50%,-50%); width:${n.hit}px; height:${n.hit}px; display:flex; align-items:center; justify-content:center; background:none; border:none; padding:0; cursor:pointer; opacity:${n.opacity}; transition:opacity .6s ease;`)}>
                <span style={s(`position:relative; display:flex; align-items:center; justify-content:center; animation:${n.orbAnim};`)}>
                  <span style={s(`position:absolute; width:${n.glowSize}px; height:${n.glowSize}px; border-radius:50%; border:1px solid rgba(242,196,128,.5); opacity:${n.beckonOp}; animation:${n.beckonAnim}; pointer-events:none;`)} />
                  <span style={s(`position:absolute; width:${n.glowSize}px; height:${n.glowSize}px; border-radius:50%; background:${n.glowBg}; animation:${n.glowAnim}; pointer-events:none;`)} />
                  <span style={s(`width:${n.coreSize}px; height:${n.coreSize}px; border-radius:50%; background:${n.coreBg}; box-shadow:${n.coreShadow};`)} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s(`position:absolute; top:58px; left:50%; transform:translateX(-50%); z-index:15; display:flex; flex-direction:column; align-items:center; gap:6px; pointer-events:none; width:82%;`)}>
        <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:${th.t4};`)}>The intention you’re nurturing</div>
        <div style={s(`font-family:'Source Serif 4',serif; font-size:17px; line-height:1.28; color:${th.t1}; text-align:center; letter-spacing:.005em;`)}>{v.intentLabel}</div>
      </div>

      <button onClick={v.toForest} style={s("position:absolute; top:38px; left:22px; z-index:20; display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:#8C7355;")}><span style={s('font-size:12px;')}>←</span> forest</button>

      {v.guideShow && (
        <>
          <div style={s(`position:absolute; top:44%; left:50%; transform:translate(-50%,-50%); z-index:16; width:74%; font-family:'Source Serif 4',serif; font-style:italic; font-size:16px; line-height:1.4; color:${th.guide}; text-align:center; pointer-events:none; opacity:0; animation:guide 5s ease forwards;`)}>From your last few entries, Inyeon noticed these.</div>
          <div style={s(`position:absolute; top:44%; left:50%; transform:translate(-50%,-50%); z-index:16; font-family:'Source Serif 4',serif; font-style:italic; font-size:16px; line-height:1.4; color:${th.guide}; text-align:center; pointer-events:none; opacity:0; animation:guide 5s ease 4.6s forwards;`)}>Follow a branch.<br />Tap a light.</div>
        </>
      )}

      {v.hintShow && (
        <div style={s(`position:absolute; bottom:106px; left:50%; transform:translateX(-50%); z-index:19; display:flex; align-items:center; gap:12px; background:${th.chip}; border:1px solid ${th.chipBd}; border-radius:999px; padding:8px 8px 8px 15px; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);`)}>
          <span style={s('display:flex; align-items:center; gap:6px;')}><span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 8px rgba(232,166,96,.55); animation:glow 7s ease-in-out infinite;')} /><span style={s(`font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:${th.t2};`)}>open</span></span>
          <span style={s('display:flex; align-items:center; gap:6px;')}><span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#F0CFA0,#C0834A); animation:breath 4.6s ease-in-out infinite;')} /><span style={s(`font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:${th.t2};`)}>in practice</span></span>
          <span style={s('display:flex; align-items:center; gap:6px;')}><span style={s('width:8px; height:8px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#A0794E,#6A4C2E); opacity:.7;')} /><span style={s(`font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:${th.t2};`)}>settled</span></span>
          <button onClick={v.dismissHint} aria-label="Dismiss legend" style={s("background:none; border:none; cursor:pointer; color:#8C7355; font-family:'IBM Plex Mono',monospace; font-size:14px; line-height:1; padding:0 4px;")}>×</button>
        </div>
      )}

      {v.barHidden && (
        <div style={s('position:absolute; bottom:26px; left:50%; transform:translateX(-50%); z-index:20; display:flex; flex-direction:column; align-items:center; gap:6px; width:100%; padding:0 24px;')}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#9A8358;")}>Holding this as a {v.formLabel}</div>
          <div style={s(`font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; color:${th.t3}; text-align:center; line-height:1.4;`)}>{v.formHint}</div>
          <button onClick={v.reChoose} style={s(`margin-top:4px; background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:${th.t4}; border-bottom:1px solid ${th.chipBd}; padding-bottom:2px;`)}>Hold this differently</button>
        </div>
      )}

      {v.barShown && <TabBar v={v} variant="landscape" active="insights" pos="position:absolute; left:22px; right:22px; bottom:20px; animation:fade .3s ease;" />}
    </>
  )
}

export function Landscape({ v }: { v: Vals }) {
  if (v.choosingMode) return <Choosing v={v} />
  if (v.intentionMode) return <Intention v={v} />
  return null
}
