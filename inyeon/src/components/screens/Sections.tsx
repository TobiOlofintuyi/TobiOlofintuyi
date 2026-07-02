import type { ReactNode } from 'react'
import { s } from '../../css'
import { TabBar } from '../TabBar'
import type { Vals } from '../types'

// The sections that predate the redesign, extended into its language: light
// paper surface, serif voice, mono eyebrows, quiet actions. Reached through
// the app switcher; each carries the standard tab bar with Apps active.

const STATUS = "display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#908A80; margin-bottom:16px;"
const TITLE = "font-family:'Source Serif 4',serif; font-size:24px; letter-spacing:-.015em; color:#1A1816; margin:0 0 4px;"
const SUB = "font-family:'Source Serif 4',serif; font-style:italic; font-size:13.5px; line-height:1.5; color:#A0968A; margin:0 0 16px;"
const EYEBROW = "font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin:0 0 7px;"
const CARD = 'background:#FFFFFF; border:1px solid #E4DFD5; border-radius:14px;'
const FOOT = "text-align:center; font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; color:#B0A696; margin-top:14px;"

export function Section({ v, title, sub, children }: { v: Vals; title: string; sub: string; children: ReactNode }) {
  return (
    <div style={s('position:absolute; inset:0; z-index:30; background:#F8F7F4;')}>
      <div className="scroll-y" style={s('position:absolute; inset:0; padding:18px 22px 96px;')}>
        <div style={s(STATUS)}>
          <span>21:41</span>
          <span style={s('letter-spacing:.08em;')}>inyeon</span>
        </div>
        <h2 style={s(TITLE)}>{title}</h2>
        <p style={s(SUB)}>{sub}</p>
        {children}
      </div>
      <TabBar v={v} variant="light" active="apps" pos="position:absolute; left:22px; right:22px; bottom:20px;" />
    </div>
  )
}

// ---------- To-dos ----------
export function Todos({ v }: { v: Vals }) {
  const check = (done: boolean) =>
    done
      ? 'width:18px; height:18px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 8px rgba(232,166,96,.45); flex:none;'
      : 'width:18px; height:18px; border-radius:50%; border:1.5px solid #C9C2B6; background:none; flex:none;'
  const row = (t: Vals, done: boolean) => (
    <button key={t.key} onClick={t.onToggle} role="checkbox" aria-checked={done} style={s(`display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:12px 0; border:none; border-top:1px solid #EFEBE2; background:none; cursor:pointer; ${done ? 'opacity:.6;' : ''}`)}>
      <span style={s(check(done))} />
      <span style={s(`font-family:'Source Serif 4',serif; font-size:15px; line-height:1.4; color:${done ? '#9A8E7C' : '#3A352F'};`)}>{t.text}</span>
    </button>
  )
  return (
    <Section v={v} title="To-dos" sub="Tasks you’ve captured — visible and checkable. No streaks, no debt.">
      <div style={s('display:flex; align-items:center; gap:9px; background:#FBF8F2; border:1px solid #DDD2C0; border-radius:12px; padding:5px 13px; margin-bottom:14px;')}>
        <input
          value={v.todoDraft}
          onChange={v.onTodoDraft}
          onKeyDown={(e) => { if (e.key === 'Enter') v.onTodoAdd(e) }}
          placeholder="Note a task…"
          aria-label="Note a task"
          style={s("flex:1; border:none; background:none; outline:none; padding:6px 0; font-family:'Source Serif 4',serif; font-size:14.5px; color:#3A352F;")}
        />
        <button onClick={v.onTodoAdd} className="hit" style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Add</button>
      </div>
      <div style={s(`${CARD} padding:2px 15px; margin-bottom:16px;`)}>
        {v.todosOpen.map((t: Vals) => row(t, false))}
        {v.todosOpen.length === 0 && (
          <div style={s("text-align:center; padding:18px 0; font-family:'Source Serif 4',serif; font-style:italic; font-size:13.5px; color:#A0968A;")}>Nothing waiting. Let the day be the day.</div>
        )}
      </div>
      {v.todosDone.length > 0 && (
        <>
          <div style={s('display:flex; align-items:baseline; justify-content:space-between;')}>
            <div style={s(EYEBROW)}>Done, let it go</div>
            <button onClick={v.onTodoClear} className="hit" style={s("background:none; border:none; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:#B0A696;")}>Clear</button>
          </div>
          <div style={s(`${CARD} padding:2px 15px;`)}>{v.todosDone.map((t: Vals) => row(t, true))}</div>
        </>
      )}
      <div style={s(FOOT)}>A task done is allowed to disappear.</div>
    </Section>
  )
}

// ---------- Patterns ----------
export function Patterns({ v }: { v: Vals }) {
  return (
    <Section v={v} title="Patterns" sub="Recurring themes and your inner-world map. Noticed, never scored.">
      {v.patternRows.map((p: Vals) => (
        <div key={p.key} style={s(`${CARD} border-radius:16px; padding:14px 16px 12px; margin-bottom:10px;`)}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.13em; text-transform:uppercase; color:#A07A50; margin-bottom:5px;")}>{p.eyebrow}</div>
          <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:15.5px; line-height:1.5; color:#3A352F; margin:0 0 9px;")}>{p.phrase}</p>
          <button onClick={p.onOpen} className="hit" style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#8A5A30; border-bottom:1px solid rgba(138,90,48,.4);")}>Where it lives →</button>
        </div>
      ))}
      <div style={s(FOOT)}>Each pattern is a door into the landscape it grew from.</div>
    </Section>
  )
}

// ---------- People ----------
function PersonCard({ p }: { p: Vals }) {
  return (
    <div key={p.key}>
      <button
        onClick={p.onTap}
        style={s(`display:flex; align-items:center; gap:12px; width:100%; text-align:left; ${CARD} padding:12px 15px; margin-bottom:${p.open ? '8px' : '10px'}; cursor:${p.hasQuote ? 'pointer' : 'default'};`)}
      >
        <span style={s("display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:#EFE6D8; font-family:'Source Serif 4',serif; font-style:italic; font-size:14px; color:#8A5A30; flex:none;")}>{p.name.replace('the ', '').slice(0, 1).toUpperCase()}</span>
        <span style={s('display:flex; flex-direction:column; gap:1px;')}>
          <span style={s("font-family:'Source Serif 4',serif; font-size:15px; color:#1A1816;")}>{p.name}</span>
          <span style={s("font-family:'Outfit',sans-serif; font-size:11.5px; color:#A0968A;")}>{p.sub}</span>
        </span>
        {p.hasQuote && <span style={s("margin-left:auto; font-family:'IBM Plex Mono',monospace; font-size:12px; color:#B0A696;")}>›</span>}
      </button>
      {p.open && (
        <div style={s('background:#FFFFFF; border:1px solid #E4DFD5; border-radius:12px; padding:13px 15px; margin-bottom:12px; animation:risesm .2s ease;')}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin-bottom:7px;")}>From your words · {p.date}</div>
          <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:15.5px; line-height:1.5; color:#3A352F; margin:0;")}>“…{p.quote}…”</p>
        </div>
      )}
    </div>
  )
}

export function People({ v }: { v: Vals }) {
  return (
    <Section v={v} title="People" sub="Everyone and everything your reflections have named.">
      <div style={s(EYEBROW)}>People</div>
      {v.peopleRows.map((p: Vals) => (
        <PersonCard key={p.key} p={p} />
      ))}
      <div style={s(`${EYEBROW} margin-top:8px;`)}>Things</div>
      {v.thingRows.map((p: Vals) => (
        <PersonCard key={p.key} p={p} />
      ))}
      <div style={s(FOOT)}>Named in passing, kept with care.</div>
    </Section>
  )
}

// ---------- Explorer ----------
export function Explorer({ v }: { v: Vals }) {
  const rows = [
    { k: 'given', label: 'Given', quote: 'I let Maya see the tired version of me, and it was fine.', date: 'From your practice' },
    { k: 'received', label: 'Received', quote: 'She asked how I was doing, like actually doing.', date: 'Thursday, March 6' },
    { k: 'self', label: 'Self', quote: 'A cold walk resets me more than an hour of planning.', date: 'Sunday, March 2' },
  ]
  return (
    <Section v={v} title="Explorer" sub="The flow of care: given, received, self.">
      {rows.map((r) => (
        <div key={r.k} style={s(`${CARD} border-radius:16px; padding:14px 16px 12px; margin-bottom:10px;`)}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#A07A50; margin-bottom:5px;")}>{r.label}</div>
          <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:15.5px; line-height:1.5; color:#3A352F; margin:0 0 6px;")}>“{r.quote}”</p>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:#B0A696;")}>{r.date}</div>
        </div>
      ))}
      <div style={s(FOOT)}>Care moves in three directions. Notice where it pools.</div>
    </Section>
  )
}

// ---------- Witness ----------
export function Witness({ v }: { v: Vals }) {
  const items = [
    { k: 'rem', kind: 'Reminder', text: v.witnessReminder },
    { k: 'plan', kind: 'Plan', text: 'The review with Maya — it passed, and it was kinder than the week before it.' },
    { k: 'msg', kind: 'Message', text: 'Dad called. The voicemail is kept, for whenever you are ready.' },
  ]
  return (
    <Section v={v} title="Witness" sub="Your life inbox: messages, plans, reminders.">
      {items.map((it) => (
        <div key={it.k} style={s(`${CARD} border-radius:16px; padding:13px 16px 12px; margin-bottom:10px;`)}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#A07A50; margin-bottom:5px;")}>{it.kind}</div>
          <p style={s("font-family:'Source Serif 4',serif; font-size:15px; line-height:1.5; color:#3A352F; margin:0;")}>{it.text}</p>
        </div>
      ))}
      <div style={s(FOOT)}>Life arrives. You decide when to meet it.</div>
    </Section>
  )
}

// ---------- Mailbox ----------
export function Mailbox({ v }: { v: Vals }) {
  return (
    <Section v={v} title="Mailbox" sub="Requests waiting to be acted on.">
      {v.mailboxResting && (
        <div style={s(`${CARD} border-radius:16px; padding:14px 16px 12px; margin-bottom:10px;`)}>
          <div style={s("font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:#A07A50; margin-bottom:5px;")}>From Inyeon</div>
          <p style={s("font-family:'Source Serif 4',serif; font-size:15px; line-height:1.5; color:#3A352F; margin:0 0 10px;")}>Prompts are resting after you set a few aside. They will return on their own, or sooner if you ask.</p>
          <button onClick={v.onWakePrompts} className="hit" style={s("background:none; border:none; padding:0 0 1px; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8A5A30; border-bottom:1px solid #8A5A30;")}>Wake them now</button>
        </div>
      )}
      <div style={s('border:1px dashed #D8CFBF; border-radius:16px; padding:22px 18px; text-align:center;')}>
        <p style={s("font-family:'Source Serif 4',serif; font-style:italic; font-size:14.5px; line-height:1.5; color:#8A8177; margin:0;")}>
          {v.mailboxResting ? 'Nothing else is waiting on you.' : 'Nothing is waiting on you.'}
        </p>
      </div>
      <div style={s(FOOT)}>An empty mailbox is a kept promise.</div>
    </Section>
  )
}
