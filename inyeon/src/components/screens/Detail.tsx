import { s } from '../../css'
import type { Vals } from '../types'

const P = "font-family:'Source Serif 4',serif; font-size:19px; line-height:1.64; letter-spacing:-.004em; color:#1A1816;"
const MIRROR_KICK = "font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:#A07A50; margin-bottom:5px;"
const MIRROR_P = "font-family:'Source Serif 4',serif; font-size:16px; line-height:1.6; color:#4A4540; margin:0;"
const SECTION = "font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#908A80;"
const DONE = "background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;"

function DrillCard({ dp, onDone, addLabel }: { dp: Vals; onDone: () => void; addLabel: string }) {
  return (
    <div className="rm-fade" style={s('background:#FFFFFF; border:1px solid #E4DFD5; border-radius:12px; padding:13px 15px; margin-top:13px; animation:risesm .2s ease;')}>
      <div style={s(`font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:${dp.eyebrowCol}; margin-bottom:7px;`)}>{dp.eyebrow}</div>
      <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:15.5px; line-height:1.5; color:#3A352F; margin:0 0 10px;")}>“…{dp.quote}…”</p>
      <div style={s('display:flex; gap:18px; align-items:center;')}>
        {dp.isSug && <button onClick={dp.onAdd} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>{addLabel}</button>}
        {dp.isOwned && (<><span style={s("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30;")}>Edit</span><span style={s("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;")}>Remove</span></>)}
        <button onClick={onDone} style={s(DONE)}>Done</button>
      </div>
    </div>
  )
}

export function Detail({ v }: { v: Vals }) {
  const d = v.detail
  return (
    <div className="scroll-y" style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4; overscroll-behavior:contain;')}>
      <div style={s('padding:14px 24px 28px;')}>
        <div style={s("display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#908A80; margin-bottom:18px;")}><span>9:41</span><span style={s('letter-spacing:.08em;')}>inyeon</span></div>
        <button onClick={d.onBack} style={s("display:block; background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; color:#A8A095; margin-bottom:16px;")}>‹ &nbsp;Entries · Thursday, March 6</button>

        {/* intention scope — a door into the Tree */}
        <button onClick={d.onScope} style={s('display:flex; align-items:center; gap:8px; background:none; border:none; padding:0; margin-bottom:14px; cursor:pointer; text-align:left;')}>
          <span style={s('width:14px; height:1px; background:#8A5A30; flex:none;')} />
          <span style={s("font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.13em; text-transform:uppercase; color:#8A5A30; line-height:1.5; border-bottom:1px solid rgba(138,90,48,.4); padding-bottom:2px;")}>Learn the language my body already speaks</span>
          <span style={s("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30;")}>→</span>
        </button>
        {d.scopeOpen && (
          <div className="rm-fade" style={s('background:#FFFFFF; border:1px solid #E4DFD5; border-radius:12px; padding:13px 15px; margin-bottom:16px; animation:risesm .2s ease;')}>
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin-bottom:7px;")}>The intention you’re nurturing</div>
            <div style={s('display:flex; align-items:center; gap:9px; margin-bottom:11px;')}>
              <span style={s('width:8px; height:8px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FCE6B6, #D6963F); box-shadow:0 0 7px rgba(232,166,96,.5); flex:none;')} />
              <span style={s("font-family:'Outfit',sans-serif; font-size:13.5px; color:#4A4540;")}>Nine insights growing on your Tree</span>
            </div>
            <div style={s("display:flex; gap:18px; font-family:'IBM Plex Mono',monospace; font-size:11px;")}>
              <button onClick={d.onOpenTree} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Open your Tree</button>
              <button onClick={d.onDone} style={s(DONE)}>Done</button>
            </div>
          </div>
        )}

        {/* transcript with evidence spans + insight-feeding underline */}
        <p style={s(`${P} margin:0 0 14px;`)}>I had the review with <span style={s(`background:${d.bgMaya}; border-radius:3px; padding:0 1px; transition:background 220ms;`)}>Maya</span> today and I had been <span style={s(`background:${d.bgDread}; border-radius:3px; padding:0 1px; transition:background 220ms;`)}>dreading it all week</span>. I barely slept, <span style={s(`background:${d.bgRehearse}; border-radius:3px; padding:0 1px; transition:background 220ms;`)}>rehearsing what I would say</span> if she brought up <span style={s(`background:${d.bgDeadline}; border-radius:3px; padding:0 1px; transition:background 220ms;`)}>the deadline I missed</span>. And then she did not even mention it.</p>
        <p style={s(`${P} margin:0 0 14px;`)}>She asked how I was doing, like actually doing, and I did not know what to say. The whole time <button onClick={d.onEvidence} style={s(`display:inline; background:${d.bgShoulders}; border:none; border-bottom:2px dotted rgba(138,90,48,.55); border-radius:3px 3px 0 0; padding:0 1px; margin:0; cursor:pointer; ${P} transition:background 220ms;`)}>my shoulders were up by my ears</button>. Afterward I noticed I was <span style={s(`background:${d.bgExhausted}; border-radius:3px; padding:0 1px; transition:background 220ms;`)}>exhausted</span>, not from the meeting, but from carrying all of it for days before.</p>
        <p style={s(`${P} margin:0 0 6px;`)}>I keep preparing for the worst version of people, and then I am surprised when they are kind.</p>

        {d.evOpen && (
          <div className="rm-fade" style={s('background:#FFFFFF; border:1px solid #E4DFD5; border-radius:12px; padding:13px 15px; margin:13px 0 4px; animation:risesm .2s ease;')}>
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#B0936A; margin-bottom:7px;")}>These words are feeding an insight</div>
            <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:15.5px; line-height:1.5; color:#3A352F; margin:0 0 10px;")}>“My shoulders tell me I’m scared before I have the words.”</p>
            <div style={s('display:flex; align-items:center; gap:8px; margin-bottom:11px;')}>
              <span style={s('width:8px; height:8px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #F6D9AE, #CD8B47); box-shadow:0 0 7px rgba(226,150,96,.45); flex:none; animation:breath 4.6s ease-in-out infinite;')} />
              <span style={s("font-family:'Outfit',sans-serif; font-size:12.5px; color:#6A655D;")}>In practice on your Tree</span>
            </div>
            <div style={s('display:flex; gap:18px;')}>
              <button onClick={d.onOpenA4} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Open the insight</button>
              <button onClick={d.onDone} style={s(DONE)}>Done</button>
            </div>
          </div>
        )}

        {/* Mentioned */}
        <div style={s(`${SECTION} margin:22px 0 9px;`)}>Mentioned</div>
        <div style={s('display:flex; flex-wrap:wrap; gap:7px;')}>
          {d.mentionChips.map((ch: Vals) => (
            <button key={ch.key} onClick={ch.onTap} style={s(`font-family:'Outfit',sans-serif; font-size:13px; padding:5px 12px; border-radius:999px; cursor:pointer; background:${ch.bg}; color:${ch.color}; border:${ch.border}; transition:all 180ms;`)}>{ch.label}</button>
          ))}
        </div>
        {d.sugMentionShow && (
          <>
            <div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A; margin:9px 0 7px;")}>Suggested to add, you can decide or edit.</div>
            <div style={s('display:flex; flex-wrap:wrap; gap:7px;')}>
              {d.mentionSugs.map((ch: Vals) => (
                <button key={ch.key} onClick={ch.onTap} style={s(`font-family:'Outfit',sans-serif; font-size:13px; padding:5px 12px; border-radius:999px; cursor:pointer; background:${ch.bg}; color:${ch.color}; border:${ch.border}; transition:all 180ms;`)}>+ {ch.label}</button>
              ))}
            </div>
          </>
        )}
        {d.dpMentionOpen && <DrillCard dp={d.dpMention} onDone={d.onDone} addLabel="Add this mention" />}

        {/* Feelings */}
        <div style={s(`${SECTION} margin:22px 0 9px;`)}>Feelings you named</div>
        <div style={s('display:flex; flex-wrap:wrap; gap:7px;')}>
          {d.feelChips.map((ch: Vals) => (
            <button key={ch.key} onClick={ch.onTap} style={s(`font-family:'Outfit',sans-serif; font-size:13px; padding:5px 12px; border-radius:999px; cursor:pointer; background:${ch.bg}; color:${ch.color}; border:${ch.border}; transition:all 180ms;`)}>{ch.label}</button>
          ))}
        </div>
        {d.sugFeelShow && (
          <>
            <div style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A; margin:9px 0 7px;")}>Suggested feelings to add, you can decide or edit.</div>
            <div style={s('display:flex; flex-wrap:wrap; gap:7px;')}>
              {d.feelSugs.map((ch: Vals) => (
                <button key={ch.key} onClick={ch.onTap} style={s(`font-family:'Outfit',sans-serif; font-size:13px; padding:5px 12px; border-radius:999px; cursor:pointer; background:${ch.bg}; color:${ch.color}; border:${ch.border}; transition:all 180ms;`)}>+ {ch.label}</button>
              ))}
            </div>
          </>
        )}
        {d.dpFeelOpen && <DrillCard dp={d.dpFeel} onDone={d.onDone} addLabel="Add this feeling" />}

        {/* The mirror */}
        <div style={s("font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#8A5A30; margin:26px 0 2px;")}>The mirror</div>
        {[
          { k: 'Noticed', p: 'A week spent rehearsing a conversation that never came.' },
          { k: 'Felt', p: 'Dread before, exhaustion after. The tiredness of holding, not doing.' },
          { k: 'Needed', p: 'Safety your body could believe, not just know about.' },
          { k: 'Asked, gently', p: 'What would the week have felt like if your shoulders had trusted you were safe?' },
        ].map((m) => (
          <div key={m.k} style={s('padding:14px 0; border-bottom:1px solid #E4DFD5;')}>
            <div style={s(MIRROR_KICK)}>{m.k}</div>
            <p style={s(MIRROR_P)}>{m.p}</p>
          </div>
        ))}
        <div style={s('display:flex; gap:18px; margin-top:12px;')}>
          <button onClick={d.onMirrorKeep} style={s(`background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:${d.mirrorKeepCol}; border-bottom:${d.mirrorKeepLine};`)}>{d.mirrorKeepLabel}</button>
          <span style={s("font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#A8A095;")}>Edit</span>
        </div>

        {/* Emerging insight */}
        <div style={s(`${SECTION} margin:26px 0 9px;`)}>Emerging insight</div>
        <div style={s('position:relative; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:16px; padding:20px 22px 18px;')}>
          <span style={s('position:absolute; top:0; right:0; width:0; height:0; border-left:24px solid transparent; border-top:24px solid #EFE8DD;')} />
          <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:18.5px; line-height:1.5; color:#3A352F; margin:0 0 16px;")}>“I keep preparing for a fight that isn’t coming.”</p>
          {d.insightUnkept && (
            <div style={s("display:flex; align-items:center; gap:16px; font-family:'IBM Plex Mono',monospace; font-size:11.5px;")}>
              <button onClick={d.onInsightKeep} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Keep</button>
              <span style={s('color:#A8A095;')}>Edit</span>
              <span style={s('color:#A8A095;')}>Remove</span>
            </div>
          )}
          {d.insightKept && (
            <>
              <div style={s("display:flex; align-items:center; gap:16px; font-family:'IBM Plex Mono',monospace; font-size:11.5px;")}>
                <span style={s('color:#9A8E7C;')}>Kept ✓</span>
                <span style={s('color:#A8A095;')}>Edit</span>
              </div>
              <div style={s('display:flex; align-items:center; gap:8px; margin-top:15px; padding-top:13px; border-top:1px solid #E4DFD5;')}>
                <span style={s('width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FCE6B6, #D6963F); box-shadow:0 0 8px rgba(232,166,96,.55); flex:none; animation:glow 7s ease-in-out infinite;')} />
                <span style={s("font-family:'Outfit',sans-serif; font-size:13px; color:#4A4540;")}>A new bud on your Tree</span>
                <button onClick={d.onSeeGrowing} style={s("margin-left:auto; background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30; white-space:nowrap;")}>See it growing</button>
              </div>
            </>
          )}
        </div>

        {/* Carried question */}
        {d.qcardOffer && (
          <div style={s('border:1px dashed #D8CFBF; border-radius:16px; padding:17px 19px 15px; margin-top:14px;')}>
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#B0936A; margin-bottom:8px;")}>A question you’re carrying</div>
            <p style={s("font-family:'Source Serif 4',serif; font-size:15.5px; line-height:1.5; color:#3A352F; margin:0 0 6px;")}>Once today, when your shoulders rise, could you soften them and name what you are feeling?</p>
            <p style={s("font-family:'Outfit',sans-serif; font-size:12px; color:#A0968A; margin:0 0 13px;")}>This entry may belong to it.</p>
            <div style={s('display:flex; gap:18px;')}>
              <button onClick={d.onAttach} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30; white-space:nowrap;")}>Attach as a reflection</button>
              <button onClick={d.onQDismiss} style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095; white-space:nowrap;")}>Not this one</button>
            </div>
          </div>
        )}
        {d.qcardAttached && (
          <div style={s('border:1px solid #DDD2C0; background:#FBF8F2; border-radius:16px; padding:17px 19px 15px; margin-top:14px;')}>
            <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#9A8E7C; margin-bottom:8px;")}>Attached ✓</div>
            <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:14.5px; line-height:1.5; color:#6A655D; margin:0 0 12px;")}>This entry now lives on that insight, part of how you are living the question.</p>
            <button onClick={d.onOpenA4} style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>See the insight</button>
          </div>
        )}

        {/* footer */}
        <div style={s('display:flex; justify-content:space-between; align-items:center; border-top:1px solid #E4DFD5; margin-top:26px; padding-top:16px;')}>
          <span style={s("font-family:'IBM Plex Mono',monospace; font-size:11px; color:#A8A095;")}>Archive</span>
          <button onClick={d.onSaveRef} style={s(`background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:${d.saveCol}; border-bottom:${d.saveLine};`)}>{d.saveLabel}</button>
        </div>
      </div>
    </div>
  )
}
