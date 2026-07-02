import { s } from '../../css'
import type { Vals } from '../types'
import { Section } from './Sections'

// Builder-mode surfaces — the principal's side of Inyeon. These are for the
// people building the app, not for journaling, so unlike every journaler
// surface they are allowed to show numbers, module names, and system state.
// Hidden entirely unless Settings → Builder → Builder mode is on.

const CARD = 'background:#FFFFFF; border:1px solid #E4DFD5; border-radius:14px;'
const EYEBROW = "font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:#908A80; margin:0 0 7px;"
const MONO = "font-family:'IBM Plex Mono',monospace; font-size:10.5px; line-height:1.7; color:#4A4540;"
const FOOT = "text-align:center; font-family:'Source Serif 4',serif; font-style:italic; font-size:12.5px; color:#B0A696; margin-top:14px;"

function BuilderTag() {
  return (
    <div style={s('display:flex; align-items:center; gap:7px; margin:-8px 0 14px;')}>
      <span style={s('width:7px; height:7px; border-radius:50%; background:radial-gradient(circle at 40% 35%,#FCE6B6,#D6963F); box-shadow:0 0 7px rgba(232,166,96,.55);')} />
      <span style={s("font-family:'IBM Plex Mono',monospace; font-size:8.5px; letter-spacing:.18em; text-transform:uppercase; color:#8A5A30;")}>Builder mode · not a journaling surface</span>
    </div>
  )
}

function MonoList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <>
      <div style={s(EYEBROW)}>{title}</div>
      <div style={s(`${CARD} padding:11px 15px; margin-bottom:14px;`)}>
        {rows.map((r) => (
          <div key={r} style={s(`${MONO} display:flex; gap:9px;`)}>
            <span style={s('color:#C99A46; flex:none;')}>·</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- Back room ----------
export function Backroom({ v }: { v: Vals }) {
  return (
    <Section v={v} title="Back room" sub="Walk the system’s architecture: capabilities, requests, ships, and seams.">
      <BuilderTag />
      <MonoList
        title="Capabilities · as built"
        rows={[
          'deterministic layout — buildSkel(form) · placeNodes(nodes, skel), memoized',
          'OFNR mirror — noticed / felt / needed / asked, per entry',
          'evidence drill-through — chip → quote → entry → insight, both directions',
          'offline persistence — IndexedDB + localStorage envelope, newest wins',
          'install — beforeinstallprompt wired, per-theme theme-color',
          'degrowth counters — dismissals rest prompts 7d; rested questions counted',
          'live retheme — th.* tokens, dark/light, one tap',
        ]}
      />
      <MonoList
        title="Requests · waiting"
        rows={[
          'voice capture — live transcript as the record forms',
          'sealed sync — encrypted blobs only, keys never leave the device',
          'push delivery — “As a push” pill is UI-only today',
          'haptics — breath in the hand; one soft tap on a question',
          'on-device model — Claude now, local later',
        ]}
      />
      <MonoList
        title="Ships"
        rows={[
          'v0.1.0 — the whole thread: onboarding → journal → mirror → Tree',
          'single-file build — the app in one HTML, for handing to anyone',
          'pages deploy — workflow on main, static host, zero server',
        ]}
      />
      <MonoList
        title="Seams · where prototype meets product"
        rows={[
          'demo practice data — three intentions, five entries, flagged in staging',
          'mic is simulated — recording settles into placeholder words',
          'entries feed is static — CARDS[], not the journal store yet',
          'warm-wording receipts — consent copy present, receipts stubbed',
        ]}
      />
      <div style={s(FOOT)}>The seams are honest. That is what makes them closable.</div>
    </Section>
  )
}

// ---------- Principals' Chair ----------
export function Chair({ v }: { v: Vals }) {
  const h = v.chairHealth
  const queue = [
    { t: '01 · First-run truth', st: 'held' },
    { t: '02 · Motion as meaning', st: 'shipped' },
    { t: '03 · Degrowth by design', st: 'shipped' },
    { t: '04 · Non-visual parity', st: 'partial' },
    { t: '05 · PWA discipline', st: 'shipped' },
    { t: '06 · One voice & the state map', st: 'shipped' },
  ]
  const stCol = (st: string) => (st === 'shipped' ? '#9A8E7C' : st === 'partial' ? '#B0936A' : '#8A5A30')
  return (
    <Section v={v} title="Principals’ Chair" sub="Oversight: the queue, the decisions in force, and the system’s health.">
      <BuilderTag />
      <div style={s(EYEBROW)}>Decisions in force</div>
      <div style={s(`${CARD} border-radius:16px; padding:6px 16px; margin-bottom:14px;`)}>
        {[
          'Deterministic first. The model proposes; the geometry never improvises.',
          'No numbers to the journaler. Size and place, never counts.',
          'Dismissal costs nothing.',
          'The local path works without consent to anything.',
          'Success is questions rested and intentions integrated — with usage going down.',
        ].map((d, i) => (
          <p key={d} style={s(`font-family:'Source Serif 4',serif; font-size:14.5px; line-height:1.5; color:#3A352F; margin:0; padding:10px 0; ${i < 4 ? 'border-bottom:1px solid #EFEBE2;' : ''}`)}>{d}</p>
        ))}
      </div>
      <div style={s(EYEBROW)}>The queue</div>
      <div style={s(`${CARD} padding:5px 15px; margin-bottom:14px;`)}>
        {queue.map((q) => (
          <div key={q.t} style={s('display:flex; justify-content:space-between; align-items:center; padding:8px 0;')}>
            <span style={s("font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:#4A4540;")}>{q.t}</span>
            <span style={s(`font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:${stCol(q.st)};`)}>{q.st}</span>
          </div>
        ))}
      </div>
      <div style={s(EYEBROW)}>Health · this device</div>
      <div style={s(`${CARD} padding:11px 15px;`)}>
        {[
          ['questions rested', String(h.questionsRested)],
          ['dismissals in current cycle (rest at 3)', String(h.promptDismissals)],
          ['prompt delivery', h.promptsResting ? `resting until ${h.restingUntil}` : h.delivery],
          ['theme', h.theme],
          ['store', 'IndexedDB · localStorage fallback'],
          ['version', 'v0.1.0'],
        ].map(([k, val]) => (
          <div key={k} style={s(`${MONO} display:flex; justify-content:space-between; gap:12px;`)}>
            <span style={s('color:#908A80;')}>{k}</span>
            <span>{val}</span>
          </div>
        ))}
      </div>
      <div style={s(FOOT)}>The metric that matters is the one that goes down.</div>
    </Section>
  )
}

// ---------- Provenance ----------
export function Provenance({ v }: { v: Vals }) {
  const traces = [
    {
      t: 'Keep → a bud on the Tree',
      steps: ['End to End · §Emerging insight', 'logic.buildDetail() · onInsightKeep', 'Detail · “A new bud on your Tree”', 'Landscape · beckon pulses ×3'],
    },
    {
      t: 'Hold this differently',
      steps: ['Fractal Build Spec · forms contract', 'logic.chooseForm(form)', 'Choosing ritual · Tree / River / Lung', 'Landscape · re-grown from the root'],
    },
    {
      t: 'Prompts resting',
      steps: ['Optimization Handoff · §03 Degrowth', 'buildDetail() · onQDismiss ×3', 'promptsRestingUntil · +7 days', 'Settings · “Prompts are resting.”'],
    },
    {
      t: 'Your words, sealed',
      steps: ['Onboarding · ob3 “A room of your own”', 'persist.ts · stamped envelope', 'IndexedDB · newest wins on load', 'No backdoor. It was a choice.'],
    },
  ]
  return (
    <Section v={v} title="Provenance" sub="Trace a thing from message to code.">
      <BuilderTag />
      {traces.map((tr) => (
        <div key={tr.t} style={s(`${CARD} border-radius:16px; padding:14px 16px 12px; margin-bottom:10px;`)}>
          <div style={s("font-family:'Source Serif 4',serif; font-size:15px; color:#1A1816; margin-bottom:8px;")}>{tr.t}</div>
          {tr.steps.map((st, i) => (
            <div key={st} style={s("display:flex; gap:9px; font-family:'IBM Plex Mono',monospace; font-size:10px; line-height:1.75; color:#6A655D;")}>
              <span style={s(`color:${i === tr.steps.length - 1 ? '#8A5A30' : '#B0A696'}; flex:none;`)}>{i === 0 ? '◦' : '→'}</span>
              <span style={i === tr.steps.length - 1 ? s('color:#8A5A30;') : undefined}>{st}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={s(FOOT)}>Every light in the landscape can say where it came from.</div>
    </Section>
  )
}
