import { s } from '../../css'
import type { Vals } from '../types'

const OB_BG = 'position:absolute; inset:0; z-index:30; background:#F8F7F4; display:flex; flex-direction:column;'
const KICKER = "text-align:center; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.22em; text-transform:uppercase; color:#9A8358; margin-bottom:20px;"
const BACK = "display:block; background:none; border:none; padding:0; cursor:pointer; text-align:left; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; color:#A8A095; margin-bottom:14px;"
const CTA = "width:100%; padding:14px 0; border-radius:999px; background:#8A5A30; color:#F8F4EC; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase;"

export function Onboarding({ v }: { v: Vals }) {
  return (
    <>
      {/* ob1 — welcome */}
      {v.ob1Mode && (
        <div style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4; padding:26px 28px 34px; display:flex; flex-direction:column;')}>
          <div style={s('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;')}>
            <div style={s("font-family:'Source Serif 4',serif; font-style:italic; font-weight:600; font-size:38px; letter-spacing:-.01em; color:#1A1816; margin-bottom:6px;")}>Inyeon</div>
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:#9A8358; margin-bottom:24px;")}>인연 · a place to return to yourself</div>
            <p style={s("font-family:'Source Serif 4',serif; font-size:18px; line-height:1.55; color:#3A352F; margin:0 0 12px; max-width:24ch;")}>Everything you need to understand yourself is already within you. This is the space to look.</p>
            <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:14px; color:#908A80; margin:0 0 34px;")}>A voice journal that listens, and grows with you.</p>
            <button onClick={v.nav.ob2} style={s("width:78%; padding:14px 0; border-radius:999px; background:#8A5A30; color:#F8F4EC; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase;")}>Begin</button>
          </div>
          <div style={s("text-align:center; font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:#B0A696;")}>No streaks · no scores · nothing to keep up</div>
        </div>
      )}

      {/* ob2 — what makes this different */}
      {v.ob2Mode && (
        <div style={s(OB_BG + ' padding:22px 26px 30px;')}>
          <div style={s(KICKER)}>Arriving</div>
          <button onClick={v.nav.ob1} style={s(BACK)}>‹ &nbsp;Back</button>
          <h2 style={s("font-family:'Source Serif 4',serif; font-size:26px; letter-spacing:-.015em; color:#1A1816; margin:0 0 8px;")}>What makes this different.</h2>
          {[
            { k: 'Voice first', p: 'Just speak. Inyeon keeps your words exactly as you said them, and reflects back what you said. Nothing more.', top: 'margin-top:10px;' },
            { k: 'A mirror, not a guide', p: 'Inyeon surfaces what appears in your words. It never decides what something means. That part is always yours.', top: '' },
            { k: 'Your words stay yours', p: 'No one at Inyeon reads your entries. When you delete, it is gone. Not archived, not anonymized. Gone.', top: '', last: true },
          ].map((r, i) => (
            <div key={i} style={s(`padding:15px 0; border-top:1px solid #E4DFD5; ${r.top}${r.last ? 'border-bottom:1px solid #E4DFD5;' : ''}`)}>
              <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:#A07A50; margin-bottom:5px;")}>{r.k}</div>
              <p style={s("font-family:'Source Serif 4',serif; font-size:15.5px; line-height:1.55; color:#4A4540; margin:0;")}>{r.p}</p>
            </div>
          ))}
          <div style={s('margin-top:auto;')}>
            <button onClick={v.nav.ob3} style={s(CTA)}>Continue</button>
          </div>
        </div>
      )}

      {/* ob3 — a room of your own */}
      {v.ob3Mode && (
        <div style={s(OB_BG + ' padding:22px 26px 30px;')}>
          <div style={s(KICKER)}>Protecting</div>
          <button onClick={v.nav.ob2} style={s(BACK)}>‹ &nbsp;Back</button>
          <h2 style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:27px; letter-spacing:-.01em; color:#1A1816; margin:0 0 10px;")}>A room of your own.</h2>
          <p style={s("font-family:'Source Serif 4',serif; font-size:16px; line-height:1.6; color:#4A4540; margin:0 0 20px;")}>When you close the app, your journal locks in a way only your phone can open. We cannot read it. We cannot copy the key. There is no backdoor. We built it this way on purpose.</p>
          <div style={s('position:relative; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:16px; padding:16px 18px;')}>
            <span style={s('position:absolute; top:0; right:0; width:0; height:0; border-left:22px solid transparent; border-top:22px solid #EFE8DD;')} />
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#B0936A; margin-bottom:7px;")}>How this works</div>
            <p style={s("font-family:'Source Serif 4',serif; font-size:14px; line-height:1.6; color:#4A4540; margin:0;")}>Your entries are sealed on your device before they leave it. Even if someone broke in, they would find words only you can read. It was a choice, not an afterthought.</p>
          </div>
          <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:14px; color:#6A655D; margin:20px 0 0; text-align:center;")}>You are not the product.<br />Your reflection is not for sale.</p>
          <div style={s('margin-top:auto;')}>
            <button onClick={v.nav.ob4} style={s(CTA)}>Next</button>
          </div>
        </div>
      )}

      {/* ob4 — plant an intention */}
      {v.ob4Mode && (
        <div style={s(OB_BG + ' padding:22px 26px 30px;')}>
          <div style={s(KICKER)}>Intending</div>
          <button onClick={v.nav.ob3} style={s(BACK)}>‹ &nbsp;Back</button>
          <h2 style={s("font-family:'Source Serif 4',serif; font-size:26px; letter-spacing:-.015em; color:#1A1816; margin:0 0 6px;")}>Plant an intention.</h2>
          <p style={s("font-family:'Source Serif 4',serif; font-size:15px; line-height:1.55; color:#6A655D; margin:0 0 12px;")}>Your insights will grow from what you plant here.</p>
          <div style={s('border-bottom:1px solid #E4DFD5;')}>
            {v.obRows.map((r: Vals) => (
              <button key={r.key} onClick={r.onTap} style={s('display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:13px 2px; border:none; border-top:1px solid #E4DFD5; background:none; cursor:pointer;')}>
                {r.sel
                  ? <span style={s('width:15px; height:15px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 12px rgba(232,166,96,.65); flex:none; animation:glow 7s ease-in-out infinite;')} />
                  : <span style={s('width:15px; height:15px; border-radius:50%; border:1.5px solid #C9C2B6; flex:none;')} />}
                <span style={s(`font-family:'Source Serif 4',serif; font-size:15.5px; color:#1A1816; font-style:${r.italic};`)}>{r.label}</span>
                {r.sel && <span style={s("margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:#9A8358;")}>planted</span>}
              </button>
            ))}
          </div>
          {v.obOwnShow && (
            <input value={v.obOwn} onChange={v.onObOwn} placeholder="Say it in your own words…" style={s("width:100%; margin-top:10px; box-sizing:border-box; border:1px solid #DDD2C0; border-radius:10px; background:#FBF8F2; padding:10px 12px; font-family:'Source Serif 4',serif; font-size:14.5px; color:#3A352F; outline:none;")} />
          )}
          <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:13px; color:#908A80; margin:14px 0 0; text-align:center;")}>This is the intention you’ll be nurturing.</p>
          <div style={s('margin-top:auto;')}>
            <button onClick={v.nav.ob5} style={s(CTA)}>Plant it</button>
          </div>
        </div>
      )}

      {/* ob5 — rhythm */}
      {v.ob5Mode && (
        <div style={s(OB_BG + ' padding:22px 26px 30px;')}>
          <div style={s(KICKER)}>Intending</div>
          <button onClick={v.nav.ob4} style={s(BACK)}>‹ &nbsp;Back</button>
          <h2 style={s("font-family:'Source Serif 4',serif; font-size:26px; letter-spacing:-.015em; color:#1A1816; margin:0 0 6px;")}>When do you return to yourself?</h2>
          <p style={s("font-family:'Source Serif 4',serif; font-size:15px; line-height:1.55; color:#6A655D; margin:0 0 12px;")}>Pick an hour and we will hold it for you, quietly.</p>
          <div style={s('border-bottom:1px solid #E4DFD5;')}>
            {v.rhythmRows.map((r: Vals) => (
              <button key={r.key} onClick={r.onTap} style={s('display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:14px 2px; border:none; border-top:1px solid #E4DFD5; background:none; cursor:pointer;')}>
                {r.sel
                  ? <span style={s('width:15px; height:15px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 12px rgba(232,166,96,.65); flex:none; animation:glow 7s ease-in-out infinite;')} />
                  : <span style={s('width:15px; height:15px; border-radius:50%; border:1.5px solid #C9C2B6; flex:none;')} />}
                <div>
                  <div style={s("font-family:'Source Serif 4',serif; font-size:15.5px; color:#1A1816;")}>{r.label}</div>
                  <div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A;")}>{r.sub}</div>
                </div>
                {r.sel
                  ? <input value={r.time} onChange={r.onTime} onClick={v.noop} style={s("margin-left:auto; width:84px; text-align:right; box-sizing:border-box; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:8px; padding:5px 8px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#3A352F; outline:none;")} />
                  : <span style={s("margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:9px; color:#B0A696;")}>{r.time}</span>}
              </button>
            ))}
          </div>
          <div style={s('margin-top:auto; display:flex; flex-direction:column; gap:12px; align-items:center;')}>
            <button onClick={v.nav.ob6} style={s(CTA)}>Continue</button>
            <button onClick={v.nav.ob6} style={s("background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; color:#A8A095; border-bottom:1px solid #D8D2C6; padding:0 0 1px;")}>Skip for now</button>
          </div>
        </div>
      )}

      {/* ob6 — first reflection */}
      {v.ob6Mode && (
        <div style={s(OB_BG + ' padding:22px 26px 30px;')}>
          <div style={s(KICKER)}>Beginning</div>
          <button onClick={v.nav.ob5} style={s(BACK)}>‹ &nbsp;Back</button>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:#8A5A30; margin-bottom:10px;")}>Your first reflection</div>
          <h2 style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:21px; line-height:1.35; color:#1A1816; margin:0 0 6px;")}>What does your body already know before you do?</h2>
          <p style={s("font-family:'Source Serif 4',serif; font-size:14.5px; color:#6A655D; margin:0 0 30px;")}>Just speak, or write. There is no wrong way in.</p>
          <div style={s('display:flex; flex-direction:column; align-items:center; gap:9px; margin-bottom:28px;')}>
            <button onClick={v.nav.breathToMirror} aria-label="Tap to speak" style={s('position:relative; display:flex; align-items:center; justify-content:center; width:68px; height:68px; background:none; border:none; cursor:pointer; padding:0;')}>
              <span style={s('position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle, rgba(240,196,126,.30), rgba(240,196,126,0) 70%); animation:breath 4.6s ease-in-out infinite;')} />
              <span style={s('position:absolute; inset:10px; border-radius:50%; border:1px solid rgba(198,138,62,.45);')} />
              <span style={s('width:12px; height:12px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FBEAC4, #C68A3E); box-shadow:0 0 14px rgba(240,190,120,.65);')} />
            </button>
            <span style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#9A8358;")}>Tap to speak</span>
          </div>
          <textarea value={v.obText} onChange={v.onObText} placeholder="Or start writing here…" style={s("width:100%; min-height:96px; resize:none; box-sizing:border-box; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:12px; padding:13px 14px; font-family:'Source Serif 4',serif; font-size:15px; line-height:1.55; color:#3A352F; outline:none;")} />
          <div style={s('margin-top:auto;')}>
            <button onClick={v.nav.breathToMirror} style={s(CTA)}>Continue</button>
          </div>
        </div>
      )}

      {/* ob7 — first mirror */}
      {v.ob7Mode && (
        <div className="scroll-y" style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4; padding:20px 26px 30px;')}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:#8A5A30; margin:8px 0 8px;")}>Your first reflection</div>
          <h2 style={s("font-family:'Source Serif 4',serif; font-size:24px; letter-spacing:-.015em; color:#1A1816; margin:0 0 4px;")}>Here is what Inyeon noticed.</h2>
          <p style={s("font-family:'Source Serif 4',serif; font-size:14.5px; line-height:1.55; color:#6A655D; margin:0 0 16px;")}>Every entry will meet you like this.</p>
          <div style={s('display:flex; align-items:center; gap:8px; margin-bottom:12px;')}>
            <span style={s('width:14px; height:1px; background:#8A5A30;')} />
            <span style={s("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.13em; text-transform:uppercase; color:#8A5A30;")}>{v.obIntentFinal}</span>
          </div>
          <p style={s("font-family:'Source Serif 4',serif; font-size:16.5px; line-height:1.6; letter-spacing:-.004em; color:#1A1816; margin:0 0 16px;")}>Mostly my shoulders. <span style={s('background:rgba(138,90,48,.14); border-radius:3px; padding:0 2px;')}>They rise before I even know I am nervous</span>, like they are trying to protect me before anything happens.</p>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin-bottom:7px;")}>Feelings you named</div>
          <div style={s('display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px;')}>
            {['nervous', 'guarded'].map((f) => (
              <span key={f} style={s("font-family:'Outfit',sans-serif; font-size:13px; padding:5px 12px; border-radius:999px; background:#FFFFFF; color:#4A4540; border:1px solid #DDD9D0;")}>{f}</span>
            ))}
            <button onClick={v.onTender} style={s(`font-family:'Outfit',sans-serif; font-size:13px; padding:5px 12px; border-radius:999px; cursor:pointer; background:${v.tenderBg}; color:${v.tenderCol}; border:${v.tenderBd};`)}>{v.tenderLabel}</button>
          </div>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#8A5A30; margin-bottom:2px;")}>The mirror</div>
          <div style={s('padding:10px 0 12px; border-bottom:1px solid #E4DFD5; margin-bottom:14px;')}>
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.13em; text-transform:uppercase; color:#A07A50; margin-bottom:4px;")}>Noticed</div>
            <p style={s("font-family:'Source Serif 4',serif; font-size:15px; line-height:1.55; color:#4A4540; margin:0;")}>A body that moves to protect you before you have the words.</p>
          </div>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin-bottom:7px;")}>Emerging insight</div>
          {v.obCardShow && (
            <div style={s('position:relative; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:16px; padding:16px 18px 14px; margin-bottom:18px;')}>
              <span style={s('position:absolute; top:0; right:0; width:0; height:0; border-left:20px solid transparent; border-top:20px solid #EFE8DD;')} />
              {v.obShowBody && (
                <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:16.5px; line-height:1.5; color:#3A352F; margin:0 0 12px;")}>“{v.obBody}”</p>
              )}
              {v.obEditing && (
                <>
                  <textarea value={v.obDraft} onChange={v.onObDraft} style={s("width:100%; min-height:64px; resize:none; box-sizing:border-box; background:#FCFAF4; border:1px solid #DDD2C0; border-radius:10px; padding:10px 12px; font-family:'Source Serif 4',serif; font-style:italic; font-size:15.5px; line-height:1.5; color:#3A352F; outline:none; margin-bottom:11px;")} />
                  <div style={s("display:flex; gap:16px; font-family:'IBM Plex Mono',monospace; font-size:11px;")}>
                    <button onClick={v.onObEditSave} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Save</button>
                    <button onClick={v.onObEditCancel} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;")}>Cancel</button>
                  </div>
                </>
              )}
              {v.obUnkept && (
                <div style={s("display:flex; gap:16px; font-family:'IBM Plex Mono',monospace; font-size:11px;")}>
                  <button onClick={v.nav.keepFirst} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Keep</button>
                  <button onClick={v.onObEdit} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;")}>Edit</button>
                  <button onClick={v.onObRemove} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;")}>Remove</button>
                </div>
              )}
              {v.obKeptShow && (
                <>
                  <div style={s("display:flex; gap:16px; font-family:'IBM Plex Mono',monospace; font-size:11px;")}>
                    <span style={s('color:#9A8E7C;')}>Kept ✓</span>
                    <button onClick={v.onObEdit} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;")}>Edit</button>
                  </div>
                  <div style={s('display:flex; align-items:center; gap:8px; margin-top:13px; padding-top:12px; border-top:1px solid #E4DFD5;')}>
                    <span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FCE6B6, #D6963F); box-shadow:0 0 8px rgba(232,166,96,.55); flex:none; animation:glow 7s ease-in-out infinite;')} />
                    <span style={s("font-family:'Outfit',sans-serif; font-size:13px; color:#4A4540;")}>A new bud on your Tree</span>
                    <button onClick={v.nav.seeFirstBud} style={s("margin-left:auto; background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30; white-space:nowrap;")}>See it growing</button>
                  </div>
                </>
              )}
            </div>
          )}
          {v.obRemoved && (
            <div style={s('border:1px dashed #D8CFBF; border-radius:16px; padding:16px 18px; margin-bottom:18px; text-align:center;')}>
              <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:14.5px; line-height:1.5; color:#8A8177; margin:0;")}>Is there something that became clear for you today?</p>
            </div>
          )}
          <button onClick={v.nav.speak} style={s(CTA)}>Enter my journal</button>
        </div>
      )}
    </>
  )
}
