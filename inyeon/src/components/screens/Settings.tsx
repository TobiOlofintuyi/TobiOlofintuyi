import { s } from '../../css'
import { TabBar } from '../TabBar'
import { promptInstall } from '../../pwa'
import type { Vals } from '../types'

const SECTION = "font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin-bottom:7px;"
const CARD = 'background:#FFFFFF; border:1px solid #E4DFD5; border-radius:14px;'
const CHEV = "margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:12px; color:#B0A696;"

export function Settings({ v }: { v: Vals }) {
  const onAddToHome = () => { void promptInstall(); v.onInstall() }
  const onDelete = () => {
    if (typeof window !== 'undefined' && window.confirm('Delete everything and start over? When you leave, everything leaves with you. This cannot be undone.')) {
      v.onDeleteAccount()
    }
  }
  return (
    <div style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4;')}>
      <div className="scroll-y" style={s('position:absolute; inset:0; padding:18px 22px 96px;')}>
        <div style={s("display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#908A80; margin-bottom:16px;")}>
          <span>21:41</span><span style={s('letter-spacing:.08em;')}>inyeon</span>
        </div>
        <h2 style={s("font-family:'Source Serif 4',serif; font-size:24px; letter-spacing:-.015em; color:#1A1816; margin:0 0 16px;")}>Settings</h2>

        {v.installShow && (
          <div style={s('border:1px dashed #D8CFBF; border-radius:14px; padding:12px 15px 11px; margin-bottom:16px;')}>
            <div style={s('display:flex; align-items:flex-start; gap:10px; margin-bottom:9px;')}>
              <span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 8px rgba(232,166,96,.55); flex:none; margin-top:5px; animation:glow 7s ease-in-out infinite;')} />
              <div>
                <div style={s("font-family:'Source Serif 4',serif; font-size:14.5px; line-height:1.35; color:#1A1816;")}>Keep Inyeon on your home screen.</div>
                <div style={s("font-family:'Outfit',sans-serif; font-size:12px; line-height:1.5; color:#A0968A;")}>It lives on your device. No app store, just a tap away.</div>
              </div>
            </div>
            <div style={s('display:flex; align-items:center; gap:18px; padding-left:19px;')}>
              <button onClick={onAddToHome} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Add to home screen</button>
              <button onClick={v.onInstall} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#B0A696;")}>Don’t show again</button>
            </div>
          </div>
        )}

        {/* profile */}
        <div style={s(`display:flex; align-items:center; gap:12px; ${CARD} padding:12px 15px; margin-bottom:16px;`)}>
          <span style={s("display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:#EFE6D8; font-family:'Source Serif 4',serif; font-style:italic; font-size:15px; color:#8A5A30; flex:none;")}>{v.pInitial}</span>
          {v.pShow && (
            <>
              <span style={s("font-family:'Outfit',sans-serif; font-size:14.5px; color:#1A1816;")}>{v.pname}</span>
              <button onClick={v.onPedit} style={s("margin-left:auto; background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#B0A696;")}>Edit</button>
            </>
          )}
          {v.pedit && (
            <>
              <input value={v.pdraft} onChange={v.onPdraft} aria-label="Your name" style={s("flex:1; border:1px solid #DDD2C0; background:#FBF8F2; border-radius:8px; padding:6px 10px; font-family:'Outfit',sans-serif; font-size:14px; color:#1A1816; outline:none;")} />
              <button onClick={v.onPsave} style={s("margin-left:auto; background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Save</button>
            </>
          )}
        </div>

        {/* intentions */}
        <div style={s(SECTION)}>The intentions you’re nurturing</div>
        <div style={s(`${CARD} padding:4px 15px; margin-bottom:16px;`)}>
          <button onClick={v.nav.intentA} style={s('display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:11px 0; border:none; border-bottom:1px solid #EFEBE2; background:none; cursor:pointer;')}>
            <span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 8px rgba(232,166,96,.55); flex:none; animation:glow 7s ease-in-out infinite;')} />
            <span><span style={s("display:block; font-family:'Source Serif 4',serif; font-size:14px; color:#1A1816;")}>Learn the language my body already speaks</span><span style={s("display:block; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:#9A8358;")}>Tree · active</span></span>
            <span style={s(CHEV)}>›</span>
          </button>
          <button onClick={v.nav.intentB} style={s('display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:11px 0; border:none; border-bottom:1px solid #EFEBE2; background:none; cursor:pointer;')}>
            <span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#F0CFA0,#C0834A); flex:none; animation:breath 4.6s ease-in-out infinite;')} />
            <span><span style={s("display:block; font-family:'Source Serif 4',serif; font-size:14px; color:#1A1816;")}>Stop apologizing for taking up space</span><span style={s("display:block; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:#9A8358;")}>River · settling</span></span>
            <span style={s(CHEV)}>›</span>
          </button>
          <button onClick={v.nav.intentC} style={s('display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:11px 0; border:none; background:none; cursor:pointer;')}>
            <span style={s('width:8px; height:8px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#A0794E,#6A4C2E); opacity:.7; flex:none;')} />
            <span><span style={s("display:block; font-family:'Source Serif 4',serif; font-size:14px; color:#3A352F;")}>Let people in before I’m sure of them</span><span style={s("display:block; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:#7E6748;")}>Lung · integrated, at rest</span></span>
            <span style={s(CHEV)}>›</span>
          </button>
        </div>

        {/* journal experience */}
        <div style={s(SECTION)}>Journal experience</div>
        <div style={s(`${CARD} padding:13px 15px; margin-bottom:16px;`)}>
          <div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:13.5px; color:#1A1816; margin-bottom:8px;")}>Prompts arrive</div>
          <div style={s('display:flex; gap:8px; margin-bottom:10px;')}>
            <button onClick={v.onDelOpen} style={s(`flex:1; text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.05em; padding:7px 0; border-radius:999px; cursor:pointer; background:${v.pOpenBg}; color:${v.pOpenCol}; border:${v.pOpenBd};`)}>When I open</button>
            <button onClick={v.onDelPush} style={s(`flex:1; text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.05em; padding:7px 0; border-radius:999px; cursor:pointer; background:${v.pPushBg}; color:${v.pPushCol}; border:${v.pPushBd};`)}>As a push</button>
            <button onClick={v.onDelOff} style={s(`flex:1; text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.05em; padding:7px 0; border-radius:999px; cursor:pointer; background:${v.pOffBg}; color:${v.pOffCol}; border:${v.pOffBd};`)}>Not at all</button>
          </div>
          {v.promptsResting && (
            <div style={s('display:flex; align-items:center; gap:8px; margin-bottom:10px;')}>
              <span style={s("flex:1; font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; line-height:1.4; color:#908A80;")}>Prompts are resting. Turn them back on any time.</span>
              <button onClick={v.onWakePrompts} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; color:#8A5A30; border-bottom:1px solid #8A5A30; white-space:nowrap;")}>Turn back on</button>
            </div>
          )}
          <div style={s('display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #EFEBE2;')}>
            <div><div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:13.5px; color:#1A1816;")}>Warm the wording</div><div style={s("font-family:'Outfit',sans-serif; font-size:11.5px; color:#A0968A;")}>Consented and receipted. Receipts in Privacy.</div></div>
            <button onClick={v.onWarm} role="switch" aria-checked={v.warmRight === '2px'} aria-label="Warm the wording" style={s(`position:relative; width:38px; height:22px; border-radius:999px; border:none; cursor:pointer; background:${v.warmBg}; flex:none;`)}><span style={s(`position:absolute; top:2px; right:${v.warmRight}; left:${v.warmLeft}; width:18px; height:18px; border-radius:50%; background:#F8F4EC;`)} /></button>
          </div>
        </div>

        {/* appearance */}
        <div style={s(SECTION)}>Appearance</div>
        <div style={s(`${CARD} padding:13px 15px; margin-bottom:16px;`)}>
          <div style={s('display:flex; gap:8px;')}>
            <button onClick={v.onThemeDark} style={s(`flex:1; text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.05em; padding:7px 0; border-radius:999px; cursor:pointer; background:${v.thDBg}; color:${v.thDCol}; border:${v.thDBd};`)}>Dark</button>
            <button onClick={v.onThemeLight} style={s(`flex:1; text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.05em; padding:7px 0; border-radius:999px; cursor:pointer; background:${v.thLBg}; color:${v.thLCol}; border:${v.thLBd};`)}>Light</button>
          </div>
          <div style={s("font-family:'Outfit',sans-serif; font-size:11.5px; color:#A0968A; margin-top:9px;")}>How the landscape holds its light.</div>
        </div>

        {/* rhythm */}
        <div style={s(SECTION)}>Rhythm</div>
        <div style={s(`${CARD} padding:13px 15px; margin-bottom:16px;`)}>
          <div style={s('display:flex; justify-content:space-between; align-items:center; margin-bottom:11px;')}>
            <div><div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#1A1816;")}>A quiet reminder</div><div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>{v.rhythmSub}</div></div>
            <button onClick={v.onRemind} role="switch" aria-checked={v.remindRight === '2px'} aria-label="A quiet reminder" style={s(`position:relative; width:38px; height:22px; border-radius:999px; border:none; cursor:pointer; background:${v.remindBg}; flex:none;`)}><span style={s(`position:absolute; top:2px; right:${v.remindRight}; left:${v.remindLeft}; width:18px; height:18px; border-radius:50%; background:#F8F4EC;`)} /></button>
          </div>
          <div style={s('display:flex; gap:6px; margin-bottom:10px;')}>
            {v.dayList.map((d: Vals) => (
              <button key={d.key} onClick={d.onTap} aria-label={d.key} style={s(`display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; cursor:pointer; background:${d.bg}; color:${d.col}; border:${d.bd}; font-family:'IBM Plex Mono',monospace; font-size:9px;`)}>{d.label}</button>
            ))}
          </div>
          <div style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; color:#908A80;")}>A practice, not a pressure.</div>
        </div>

        {/* safety */}
        <div style={s(SECTION)}>Safety</div>
        <div style={s(`${CARD} padding:13px 15px; margin-bottom:16px;`)}>
          <div style={s('display:flex; justify-content:space-between; align-items:center;')}>
            <div><div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#1A1816;")}>Emergency contacts</div><div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>People who can reach you, kept close.</div></div>
            <span style={s(CHEV)}>›</span>
          </div>
          <div style={s('display:flex; gap:7px; margin-top:10px;')}>
            {['Mom', 'Rishi'].map((p) => (
              <span key={p} style={s("font-family:'Outfit',sans-serif; font-size:13px; padding:4px 11px; border-radius:999px; background:#FFFFFF; color:#4A4540; border:1px solid #DDD9D0;")}>{p}</span>
            ))}
          </div>
        </div>

        {/* my circle */}
        <div style={s(SECTION)}>My circle</div>
        <div style={s(`${CARD} padding:13px 15px; margin-bottom:16px;`)}>
          <div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#1A1816;")}>My circle</div>
          <div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>The people who show up in your journal. Coming soon.</div>
        </div>

        {/* intelligence */}
        <div style={s(SECTION)}>Intelligence</div>
        <div style={s(`display:flex; justify-content:space-between; align-items:center; ${CARD} padding:13px 15px; margin-bottom:16px;`)}>
          <div><div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#1A1816;")}>Model</div><div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>Claude. An on-device model is coming later.</div></div>
          <span style={s(CHEV)}>›</span>
        </div>

        {/* my data */}
        <div style={s(SECTION)}>My data</div>
        <div style={s(`${CARD} padding:4px 15px; margin-bottom:16px;`)}>
          {[
            { t: 'Privacy', d: 'We cannot see your journal. Only you can.', b: true },
            { t: 'Export my journal', d: 'Download everything you have written.', b: true },
            { t: 'Import', d: 'Bring your journal in.', b: false },
          ].map((r) => (
            <div key={r.t} style={s(`display:flex; justify-content:space-between; align-items:center; padding:11px 0; ${r.b ? 'border-bottom:1px solid #EFEBE2;' : ''}`)}>
              <div><div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#1A1816;")}>{r.t}</div><div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>{r.d}</div></div>
              <span style={s(CHEV)}>›</span>
            </div>
          ))}
        </div>

        {/* account */}
        <div style={s(SECTION)}>Account</div>
        <div style={s(`${CARD} padding:4px 15px; margin-bottom:20px;`)}>
          <button onClick={v.replay} style={s('display:block; width:100%; text-align:left; background:none; border:none; border-bottom:1px solid #EFEBE2; cursor:pointer; padding:11px 0;')}>
            <div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#1A1816;")}>Replay onboarding</div>
            <div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>Walk through the intro again.</div>
          </button>
          <button onClick={onDelete} style={s('display:block; width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:11px 0;')}>
            <div style={s("font-family:'Outfit',sans-serif; font-weight:500; font-size:14px; color:#B4776A;")}>Delete account</div>
            <div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>When you leave, everything leaves with you.</div>
          </button>
        </div>

        <div style={s("text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.08em; color:#B0A696; line-height:1.8;")}>Inyeon v0.1.0<br />Built with care. Your words, your sovereignty.</div>
      </div>
      <TabBar v={v} variant="light" active="settings" pos="position:absolute; left:22px; right:22px; bottom:20px;" />
    </div>
  )
}
