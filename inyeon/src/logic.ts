import {
  STROKE, STROKE_LIGHT, FORMS, FORMHINT, SHAPELABEL, QMODE, QNODE, QTEMPLATES,
  ENTRIES, EV, INTENTIONS, ORDER, CHIPS, OBOPTS, RH, CARDS,
  type FormId, type InsightNode, type QStatus,
} from './data'
import { buildSkel, placeNodes, tierPaths, type Skel, type Tiers, type Pt } from './fractal'
import { schedulePersist, clearState } from './persist'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any
type EventLike = { stopPropagation?: () => void; target?: { value?: string }; currentTarget?: unknown } | undefined

export interface State {
  onboarded: boolean
  forms: { A: FormId | null; B: FormId | null; C: FormId | null }
  mode: string
  intent: 'A' | 'B' | 'C'
  openId: string | null
  hoverId: string | null
  over: Record<string, QStatus>
  touched: boolean
  hintSeen: boolean
  entryOpen: Any
  composeFor: string | null
  composeText: string
  composeRecording: boolean
  reflections: Record<string, { text: string; date: string }[]>
  drill: { kind: string; id?: string } | null
  added: Record<string, boolean>
  mirrorKept: boolean
  insightKept: boolean
  qcard: 'offer' | 'attached' | 'dismissed'
  savedRef: boolean
  focusBeckon: string | null
  breathTo: string
  promptGone: boolean
  obKept: boolean
  obIntent: string
  obOwn: string
  obRhythm: string
  obText: string
  obEditing: boolean
  obDraft: string
  obBody: string
  obRemoved: boolean
  obTender: boolean
  entQ: string
  entFilter: 'new' | 'held'
  held: Record<string, boolean>
  entryFrom: string
  delivery: 'open' | 'push' | 'off'
  warm: boolean
  remind: boolean
  days: Record<string, boolean>
  installGone: boolean
  pname: string
  pedit: boolean
  pdraft: string
  times: { am: string; mid: string; eve: string }
  theme: 'dark' | 'light'
  speakWriting: boolean
  speakText: string
  barShown: boolean
  // Degrowth-by-design local counters (never surfaced as numbers, Law 8/G1).
  promptDismissals: number
  questionsRested: number
  promptsRestingUntil: number | null
}

const INITIAL: State = {
  onboarded: false,
  forms: { A: null, B: 'river', C: 'lung' },
  mode: 'ob1', intent: 'A', openId: null, hoverId: null, over: {}, touched: false, hintSeen: false,
  entryOpen: null, composeFor: null, composeText: '', composeRecording: false, reflections: {},
  drill: null, added: {}, mirrorKept: false, insightKept: false, qcard: 'offer', savedRef: false,
  focusBeckon: null, breathTo: 'detail', promptGone: false, obKept: false, obIntent: 'body', obOwn: '',
  obRhythm: 'eve', obText: '', obEditing: false, obDraft: '', obBody: 'My shoulders know before I do.',
  obRemoved: false, obTender: false, entQ: '', entFilter: 'new', held: { m6: true, m1: true },
  entryFrom: 'insight', delivery: 'open', warm: true, remind: true,
  days: { M: true, T: true, W: true, Th: true, F: true, Sa: false, Su: true },
  installGone: false, pname: 'Sam', pedit: false, pdraft: '',
  times: { am: '7:30 AM', mid: '12:30 PM', eve: '9:00 PM' },
  theme: 'dark', speakWriting: false, speakText: '', barShown: false,
  promptDismissals: 0, questionsRested: 0, promptsRestingUntil: null,
}

// Keys that carry the person's practice + preferences across sessions. Transient
// UI state (open overlays, drafts, hover) is deliberately not persisted.
const PERSIST_KEYS: (keyof State)[] = [
  'onboarded', 'forms', 'over', 'reflections', 'added', 'mirrorKept', 'insightKept', 'qcard',
  'obKept', 'obIntent', 'obOwn', 'obRhythm', 'obText', 'obBody', 'obRemoved', 'obTender',
  'held', 'delivery', 'warm', 'remind', 'days', 'installGone', 'pname', 'times', 'theme',
  'promptDismissals', 'questionsRested', 'promptsRestingUntil',
]

const MAIN_MODES = new Set(['speak', 'entries', 'settings', 'intention', 'forest', 'detail'])

function stop(fn: (e?: EventLike) => void) {
  return (e?: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); fn(e) }
}

export class Logic {
  state: State = { ...INITIAL }
  private version = 0
  private subs = new Set<() => void>()

  // --- store mechanics (React-facing) ---
  subscribe = (fn: () => void): (() => void) => {
    this.subs.add(fn)
    return () => this.subs.delete(fn)
  }
  getSnapshot = (): number => this.version

  setState(update: Partial<State> | ((s: State) => Partial<State>)): void {
    const patch = typeof update === 'function' ? update(this.state) : update
    this.state = { ...this.state, ...patch }
    if (this.state.mode && MAIN_MODES.has(this.state.mode)) this.state.onboarded = true
    this.version++
    this.persist()
    this.subs.forEach((fn) => fn())
  }

  private persist(): void {
    const out: Record<string, unknown> = {}
    for (const k of PERSIST_KEYS) out[k] = this.state[k]
    schedulePersist(out)
  }

  hydrate(saved: Partial<State> | null): void {
    if (saved && typeof saved === 'object') {
      this.state = { ...INITIAL, ...saved }
    }
    // On a returning visit, open the journal rather than replaying onboarding.
    this.state.mode = this.state.onboarded ? 'speak' : 'ob1'
    this.version++
  }

  // --- theme strokes ---
  TH(): Record<FormId, typeof STROKE.tree> {
    return this.state.theme === 'light' ? STROKE_LIGHT : STROKE
  }

  // --- memoized geometry (one-time cost per form / intention) ---
  private skelCache = new Map<FormId, Skel>()
  private tiersCache = new Map<FormId, Tiers>()
  private posCache = new Map<string, Record<string, Pt>>()
  skel(form: FormId): Skel {
    let v = this.skelCache.get(form)
    if (!v) { v = buildSkel(form); this.skelCache.set(form, v) }
    return v
  }
  tiers(form: FormId): Tiers {
    let v = this.tiersCache.get(form)
    if (!v) { v = tierPaths(form, this.skel(form)); this.tiersCache.set(form, v) }
    return v
  }
  pos(intent: string, form: FormId, nodes: InsightNode[]): Record<string, Pt> {
    const key = intent + ':' + form
    let v = this.posCache.get(key)
    if (!v) { v = placeNodes(nodes, this.skel(form)); this.posCache.set(key, v) }
    return v
  }

  // --- helpers ported from DCLogic ---
  qstatusOf(intent: string, n: InsightNode): QStatus {
    return this.state.over[intent + ':' + n.id] || n.q
  }
  formOf(intent: string): FormId {
    return this.state.forms[intent as 'A' | 'B' | 'C'] || INTENTIONS[intent].form
  }
  go(m: string, extra?: Partial<State>) {
    return (e?: EventLike) => {
      if (e && e.stopPropagation) e.stopPropagation()
      this.setState({ mode: m, openId: null, hoverId: null, entryOpen: null, composeFor: null, drill: null, barShown: false, ...(extra || {}) })
    }
  }

  buildApp(): Any {
    const S = this.state
    const obRows = OBOPTS.map((o) => ({
      key: o.k, label: o.own && S.obOwn ? S.obOwn : o.label,
      sel: S.obIntent === o.k, unsel: S.obIntent !== o.k,
      italic: o.own && !S.obOwn ? 'italic' : 'normal',
      onTap: stop(() => this.setState({ obIntent: o.k })),
    }))
    const obSel = OBOPTS.find((o) => o.k === S.obIntent) || OBOPTS[1]
    const obIntentFinal = S.obIntent === 'own' ? S.obOwn || 'In my own words' : obSel.label
    const rhythmRows = RH.map((r) => ({
      key: r.k, label: r.label, sub: r.sub, sel: S.obRhythm === r.k, unsel: S.obRhythm !== r.k,
      time: S.times[r.k as 'am' | 'mid' | 'eve'],
      onTime: (e: EventLike) => this.setState((s) => ({ times: { ...s.times, [r.k]: e?.target?.value ?? '' } })),
      onTap: stop(() => this.setState({ obRhythm: r.k })),
    }))
    const rc = RH.find((r) => r.k === S.obRhythm) || RH[2]

    const q = (S.entQ || '').toLowerCase()
    let lastMonth: string | null = null
    const entCards: Any[] = []
    CARDS.forEach((c) => {
      const held = !!S.held[c.k]
      if (S.entFilter === 'held' && !held) return
      if (q && c.text.toLowerCase().indexOf(q) < 0 && c.date.toLowerCase().indexOf(q) < 0 && c.chips.join(' ').indexOf(q) < 0) return
      const showMonth = c.month !== lastMonth
      lastMonth = c.month
      entCards.push({
        key: c.k, showMonth, month: c.month, date: c.date, dur: c.dur, text: c.text,
        chipA: c.chips[0], chipB: c.chips[1],
        fold: held ? '#EFE8DD' : 'transparent',
        holdLabel: held ? 'Held' : 'Hold', holdCol: held ? '#9A8358' : '#B0A696',
        onHold: stop(() => this.setState((s) => ({ held: { ...s.held, [c.k]: !s.held[c.k] } }))),
        onOpen: stop(() => {
          if (c.detail) this.setState({ mode: 'detail', entryOpen: null, drill: null })
          else this.setState({ entryOpen: { e: c.e, q: '' }, entryFrom: 'entries' })
        }),
      })
    })

    const pill = (on: boolean) => (on
      ? { bg: '#8A5A30', col: '#F8F4EC', bd: '1px solid #8A5A30' }
      : { bg: '#FFFFFF', col: '#6A655D', bd: '1px solid #DDD9D0' })
    const pOpen = pill(S.delivery === 'open'), pPush = pill(S.delivery === 'push'), pOff = pill(S.delivery === 'off')
    const fNew = pill(S.entFilter === 'new'), fHeld = pill(S.entFilter === 'held')
    const dayList = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].map((k) => ({
      key: k, label: k.slice(0, 1),
      bg: S.days[k] ? '#8A5A30' : '#FFFFFF', col: S.days[k] ? '#F8F4EC' : '#6A655D',
      bd: S.days[k] ? '1px solid #8A5A30' : '1px solid #DDD9D0',
      onTap: stop(() => this.setState((s) => ({ days: { ...s.days, [k]: !s.days[k] } }))),
    }))

    const resting = !!S.promptsRestingUntil && Date.now() < (S.promptsRestingUntil || 0)

    return {
      obUnkept: !S.obKept && !S.obRemoved && !S.obEditing, obKeptShow: S.obKept && !S.obRemoved && !S.obEditing,
      obCardShow: !S.obRemoved, obShowBody: !S.obEditing, obRemoved: S.obRemoved, obEditing: S.obEditing,
      obRows, obOwnShow: S.obIntent === 'own', obOwn: S.obOwn,
      onObOwn: (e: EventLike) => this.setState({ obOwn: e?.target?.value ?? '' }),
      obIntentFinal,
      rhythmRows, rhythmLabel: rc.label + ' · your hour', rhythmSub: rc.label + 's at ' + S.times[S.obRhythm as 'am' | 'mid' | 'eve'],
      obText: S.obText, onObText: (e: EventLike) => this.setState({ obText: e?.target?.value ?? '' }),
      obBody: S.obBody, obDraft: S.obDraft,
      onObDraft: (e: EventLike) => this.setState({ obDraft: e?.target?.value ?? '' }),
      onObEdit: stop(() => this.setState({ obEditing: true, obDraft: this.state.obBody })),
      onObEditSave: stop(() => this.setState({ obBody: (this.state.obDraft || '').trim() || this.state.obBody, obEditing: false })),
      onObEditCancel: stop(() => this.setState({ obEditing: false })),
      onObRemove: stop(() => this.setState({ obRemoved: true })),
      tenderBg: S.obTender ? '#FFFFFF' : 'transparent', tenderCol: S.obTender ? '#4A4540' : '#9A8E7C',
      tenderBd: S.obTender ? '1px solid #DDD9D0' : '1px dashed #D8CFBF', tenderLabel: S.obTender ? 'tender' : '+ tender',
      onTender: stop(() => this.setState({ obTender: true })),
      speakWriting: S.speakWriting, speakVoiceShow: !S.speakWriting,
      speakHint: S.speakWriting ? 'Just write. Nothing needs to be sorted out first.' : 'Just speak. Nothing needs to be sorted out first.',
      speakText: S.speakText, onSpeakText: (e: EventLike) => this.setState({ speakText: e?.target?.value ?? '' }),
      onWriteInstead: stop(() => this.setState({ speakWriting: true })),
      onSpeakVoice: stop(() => this.setState({ speakWriting: false })),
      entQ: S.entQ, onEntQ: (e: EventLike) => this.setState({ entQ: e?.target?.value ?? '' }),
      fNewBg: fNew.bg, fNewCol: fNew.col, fNewBd: fNew.bd, fHeldBg: fHeld.bg, fHeldCol: fHeld.col, fHeldBd: fHeld.bd,
      onFilterNew: stop(() => this.setState({ entFilter: 'new' })), onFilterHeld: stop(() => this.setState({ entFilter: 'held' })),
      entCards, entEmpty: entCards.length === 0,
      pOpenBg: pOpen.bg, pOpenCol: pOpen.col, pOpenBd: pOpen.bd,
      pPushBg: pPush.bg, pPushCol: pPush.col, pPushBd: pPush.bd,
      pOffBg: pOff.bg, pOffCol: pOff.col, pOffBd: pOff.bd,
      onDelOpen: stop(() => this.setState({ delivery: 'open' })), onDelPush: stop(() => this.setState({ delivery: 'push' })), onDelOff: stop(() => this.setState({ delivery: 'off' })),
      promptsResting: resting,
      onWakePrompts: stop(() => this.setState({ promptsRestingUntil: null, promptDismissals: 0 })),
      warmBg: S.warm ? '#8A5A30' : '#D8D2C6', warmRight: S.warm ? '2px' : 'auto', warmLeft: S.warm ? 'auto' : '2px',
      onWarm: stop(() => this.setState({ warm: !this.state.warm })),
      remindBg: S.remind ? '#8A5A30' : '#D8D2C6', remindRight: S.remind ? '2px' : 'auto', remindLeft: S.remind ? 'auto' : '2px',
      onRemind: stop(() => this.setState({ remind: !this.state.remind })),
      dayList,
      installShow: !S.installGone,
      onInstall: stop(() => this.setState({ installGone: true })),
      pname: S.pname, pInitial: (S.pname || 'S').slice(0, 1).toUpperCase(), pShow: !S.pedit, pedit: S.pedit, pdraft: S.pdraft,
      onPdraft: (e: EventLike) => this.setState({ pdraft: e?.target?.value ?? '' }),
      onPedit: stop(() => this.setState({ pedit: true, pdraft: this.state.pname })),
      onPsave: stop(() => this.setState({ pname: (this.state.pdraft || '').trim() || this.state.pname, pedit: false })),
      replay: this.go('ob1', { onboarded: false, obKept: false, obRemoved: false, obEditing: false, promptGone: false, touched: false, hintSeen: false }),
      th: S.theme === 'light'
        ? {
            scrBg: 'radial-gradient(ellipse 92% 78% at 50% 46%, #F6F1E6 0%, #ECE4D5 55%, #DFD6C4 100%)',
            status: '#6E5838', t1: '#2A2118', t2: '#6A5B45', t3: '#5A4326', t4: '#654B27',
            guide: '#7A5A2E', chip: 'rgba(255,251,244,.86)', chipBd: '#DDD2C0',
            panelBg: 'linear-gradient(180deg, #FBF7EF, #F2EADB)', panelBd: '#E0D8C8',
            pT1: '#2A2118', pT2: '#3A352F', pT3: '#8A5A30',
            scrim: 'rgba(70,58,44,.28)', scrim2: 'rgba(70,58,44,.34)',
            optBg: 'rgba(120,80,30,.05)', optBd: 'rgba(138,90,48,.25)', optHd: '#8A5A30',
            tabHi: '#8A5A30', fLabel: '#2A2118',
          }
        : {
            scrBg: 'radial-gradient(ellipse 92% 78% at 50% 46%, #2A1E14 0%, #17110B 46%, #0C0906 100%)',
            status: '#9A7F5E', t1: '#EADCC5', t2: '#B7A184', t3: '#8C7355', t4: '#7C6849',
            guide: '#D3BC90', chip: 'rgba(20,14,9,.72)', chipBd: 'rgba(200,158,100,.18)',
            panelBg: 'linear-gradient(180deg, rgba(38,28,19,.94), rgba(26,19,13,.96))', panelBd: 'rgba(200,158,100,.22)',
            pT1: '#F1E6D2', pT2: '#DFCFB4', pT3: '#B0895A',
            scrim: 'rgba(8,5,3,.62)', scrim2: 'rgba(8,5,3,.72)',
            optBg: 'rgba(255,240,210,.03)', optBd: 'rgba(200,158,100,.2)', optHd: '#E4B872',
            tabHi: '#E4B872', fLabel: '#E4D6BF',
          },
      thDBg: S.theme !== 'light' ? '#8A5A30' : '#FFFFFF', thDCol: S.theme !== 'light' ? '#F8F4EC' : '#6A655D', thDBd: S.theme !== 'light' ? '1px solid #8A5A30' : '1px solid #DDD9D0',
      thLBg: S.theme === 'light' ? '#8A5A30' : '#FFFFFF', thLCol: S.theme === 'light' ? '#F8F4EC' : '#6A655D', thLBd: S.theme === 'light' ? '1px solid #8A5A30' : '1px solid #DDD9D0',
      onThemeDark: stop(() => this.setState({ theme: 'dark' })), onThemeLight: stop(() => this.setState({ theme: 'light' })),
      onDeleteAccount: stop(() => { void clearState().then(() => { this.state = { ...INITIAL }; this.setState({ mode: 'ob1', onboarded: false }) }) }),
    }
  }

  nodeView(n: InsightNode, p: Pt, intent: string, hoverId: string | null, beckonId: string | null | undefined): Any {
    const q = this.qstatusOf(intent, n)
    const cs = n.m === 'bud' ? 12 : n.m === 'evidenced' ? 30 : 20
    const coreSize = q === 'integrated' ? cs * 0.85 : cs
    const glowSize = q === 'integrated' ? coreSize * 1.9 : coreSize * 3.1
    let op = n.m === 'bud' ? 0.82 : n.m === 'evidenced' ? 1 : 0.93
    if (q === 'integrated') op *= 0.72
    if (hoverId && hoverId !== n.id) op *= 0.3
    let coreBg: string, glowBg: string, coreShadow: string, glowAnim: string, orbAnim: string
    if (q === 'open') {
      coreBg = 'radial-gradient(circle at 38% 32%, #FCE6B6, #D6963F 68%, #B07830)'
      glowBg = 'radial-gradient(circle, rgba(240,182,108,0.5), rgba(240,182,108,0) 70%)'
      coreShadow = '0 0 20px rgba(232,166,96,0.55)'; glowAnim = 'glow 7s ease-in-out infinite'; orbAnim = 'none'
    } else if (q === 'practice') {
      coreBg = 'radial-gradient(circle at 38% 32%, #F6D9AE, #CD8B47 68%, #9E6A34)'
      glowBg = 'radial-gradient(circle, rgba(232,168,120,0.5), rgba(232,168,120,0) 70%)'
      coreShadow = '0 0 18px rgba(226,150,96,0.5)'; glowAnim = 'none'; orbAnim = 'breath 4.6s ease-in-out infinite'
    } else {
      coreBg = 'radial-gradient(circle at 40% 35%, #A98456, #6F4E30 78%)'
      glowBg = 'radial-gradient(circle, rgba(150,116,74,0.28), rgba(150,116,74,0) 70%)'
      coreShadow = '0 0 9px rgba(120,90,58,0.4)'; glowAnim = 'none'; orbAnim = 'none'
    }
    const beckon = n.id === beckonId
    return {
      key: n.id, leftPct: p.x / 10, topPct: p.y / 10, hit: Math.max(glowSize, 42),
      coreSize, glowSize, coreBg, glowBg, coreShadow, glowAnim, orbAnim, opacity: op,
      beckonOp: beckon ? 1 : 0, beckonAnim: beckon ? 'beckon 2.4s ease-out 3' : 'none',
      label: n.body, q,
      onTap: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ openId: n.id, touched: true, focusBeckon: null }) },
      onEnter: () => this.setState({ hoverId: n.id }), onLeave: () => this.setState({ hoverId: null }),
    }
  }

  buildPanel(intent: string, n: InsightNode): Any {
    const q = this.qstatusOf(intent, n)
    const close = (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ openId: null }) }
    const to = (st: QStatus) => (e: EventLike) => {
      if (e && e.stopPropagation) e.stopPropagation()
      this.setState((s) => ({
        over: { ...s.over, [intent + ':' + n.id]: st },
        questionsRested: st === 'integrated' ? s.questionsRested + 1 : s.questionsRested,
      }))
    }
    const prim = { bg: '#C98A46', fg: '#1A130B', bd: '#C98A46' }
    const ghost = this.state.theme === 'light'
      ? { bg: 'transparent', fg: '#6A5B45', bd: 'rgba(107,91,69,0.35)' }
      : { bg: 'transparent', fg: '#B7A489', bd: 'rgba(183,164,137,0.28)' }
    let statusLine: string, acts: Any[]
    if (q === 'open') {
      statusLine = 'This one is meant to be lived, not answered here. Take it with you.'
      acts = [{ label: 'Practice this', ...prim, onTap: to('practice') }, { label: 'Not yet', ...ghost, onTap: close }]
    } else if (q === 'practice') {
      statusLine = 'You are living this one. It settles by being lived, not by checking in here.'
      acts = [
        { label: 'Still living it', ...ghost, onTap: close },
        { label: 'Note how it’s going', ...ghost, onTap: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ composeFor: n.id, composeText: '' }) } },
        { label: 'Insight has settled', ...ghost, onTap: to('integrated') },
      ]
    } else {
      statusLine = 'This has settled into you. It is yours now.'
      acts = [{ label: 'Open it again', ...ghost, onTap: to('open') }, { label: 'Close', ...ghost, onTap: close }]
    }
    return {
      eyebrow: (SHAPELABEL[n.shape] || 'A pattern') + (n.bringOwn ? ' · in your words' : ''),
      body: n.body, qLabel: n.bringOwn ? 'A question in your own words' : 'A question to ' + (QMODE[n.shape] || 'live out'),
      question: n.bringOwn ? n.ownQ : QNODE[n.id] || QTEMPLATES[n.shape],
      statusLine, actions: acts, onClose: close, stop: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation() },
      ...this.buildEvidence(intent, n),
    }
  }

  buildForest(): Any[] {
    return ORDER.map((id) => {
      const I = INTENTIONS[id]
      const ns = I.nodes
      const form = this.formOf(id)
      const skel = this.skel(form)
      const pos = this.pos(id, form, ns)
      const tiers = this.tiers(form)
      const dots = ns.map((nd) => {
        const q = this.qstatusOf(id, nd)
        const p = pos[nd.id] || skel.root
        const c = q === 'open'
          ? 'radial-gradient(circle at 40% 35%, #FCE6B6, #D6963F)'
          : q === 'practice'
            ? 'radial-gradient(circle at 40% 35%, #F0CFA0, #C0834A)'
            : 'radial-gradient(circle at 40% 35%, #A0794E, #6A4C2E)'
        const shadow = q === 'open' ? '0 0 8px rgba(232,166,96,.6)' : q === 'practice' ? '0 0 6px rgba(226,150,96,.45)' : 'none'
        return {
          key: nd.id, x: p.x / 10, y: p.y / 10,
          size: nd.m === 'bud' ? 6 : nd.m === 'evidenced' ? 11 : 8, c, shadow,
          op: q === 'integrated' ? 0.6 : 0.96,
          anim: q === 'practice' ? 'breath 4.6s ease-in-out infinite' : q === 'open' ? 'glow 7s ease-in-out infinite' : 'none',
        }
      })
      const centerGlow = id === 'A'
        ? 'radial-gradient(circle, rgba(240,190,120,.24), transparent 68%)'
        : id === 'B'
          ? 'radial-gradient(circle, rgba(200,150,96,.18), transparent 68%)'
          : 'radial-gradient(circle, rgba(150,116,74,.13), transparent 68%)'
      return {
        key: id, label: I.label, stage: I.stage, stageColor: I.stageColor, centerGlow, dots,
        formLabel: (FORMS.find((f) => f.id === form) || ({} as Any)).label,
        miniPath: (tiers.thick + ' ' + tiers.mid + ' ' + tiers.thin).trim(),
        miniStroke: this.TH()[form].core,
        rootX: skel.root.x / 10, rootY: skel.root.y / 10,
        onEnter: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mode: 'intention', intent: id as 'A' | 'B' | 'C', openId: null, hoverId: null }) },
      }
    })
  }

  chooseForm(f: FormId) {
    return (e: EventLike) => {
      if (e && e.stopPropagation) e.stopPropagation()
      this.setState((s) => ({ forms: { ...s.forms, [s.intent]: f }, mode: 'intention', openId: null }))
    }
  }

  buildEvidence(intent: string, n: InsightNode): Any {
    const list = (EV[n.id] || []).map((ev) => ({ kind: 'entry', e: ev.e, q: ev.q }))
    const refs = (this.state.reflections[n.id] || []).map((r) => ({ kind: 'reflection', text: r.text, date: r.date }))
    const all: Any[] = (list as Any[]).concat(refs)
    if (!all.length) return { hasEv: false }
    const form = this.formOf(intent)
    const skel = this.skel(form)
    const byDist = [...skel.slots].sort((a, b) => b.dist - a.dist)
    const evNodes = all.map((item, i) => {
      const sl = byDist[i * 2] || byDist[i] || skel.root
      const isRef = item.kind === 'reflection'
      return {
        key: item.kind + i, x: sl.x / 10, y: sl.y / 10,
        dot: isRef ? 'radial-gradient(circle at 40% 35%, #EDE6CC, #B8A566)' : 'radial-gradient(circle at 40% 35%, #FCE6B6, #D6963F)',
        ring: isRef ? '1px solid rgba(214,200,150,.7)' : '0 solid transparent',
        onTap: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ entryFrom: 'insight', entryOpen: isRef ? { kind: 'reflection', text: item.text, date: item.date } : { e: item.e, q: item.q } }) },
      }
    })
    const tiers = this.tiers(form)
    const ec = list.length, rc = refs.length
    let cap = 'The same shape, one scale in. It branches from ' + ec + (ec === 1 ? ' entry' : ' entries')
    if (rc) cap += ', and ' + rc + (rc === 1 ? ' reflection' : ' reflections') + ' you have added'
    cap += '.'
    return {
      hasEv: true, evCaption: cap,
      miniPath: (tiers.thick + ' ' + tiers.mid + ' ' + tiers.thin).trim(),
      miniStroke: this.TH()[form].core,
      rootX: skel.root.x / 10, rootY: skel.root.y / 10, evNodes,
    }
  }

  buildCompose(): Any {
    const id = this.state.composeFor
    let node: InsightNode | null = null
    INTENTIONS[this.state.intent].nodes.forEach((x) => { if (x.id === id) node = x })
    if (!node) return null
    const nd: InsightNode = node
    const q = nd.bringOwn ? nd.ownQ : QNODE[id!] || QTEMPLATES[nd.shape]
    const rec = this.state.composeRecording
    return {
      insightBody: nd.body, question: q, text: this.state.composeText,
      micAnim: rec ? 'breath 1.3s ease-in-out infinite' : 'none',
      micBg: rec ? 'rgba(214,150,63,.14)' : 'transparent',
      micBorder: rec ? 'rgba(214,150,63,.55)' : '#E0D8C8',
      onText: (e: EventLike) => this.setState({ composeText: e?.target?.value ?? '' }),
      onMic: (e: EventLike) => {
        if (e && e.stopPropagation) e.stopPropagation()
        this.setState((s) => {
          if (s.composeRecording) {
            const t = (s.composeText || '').trim() ? s.composeText : 'It is getting easier to catch my shoulders before the words come.'
            return { composeRecording: false, composeText: t }
          }
          return { composeRecording: true }
        })
      },
      onSave: (e: EventLike) => {
        if (e && e.stopPropagation) e.stopPropagation()
        const t = (this.state.composeText || '').trim()
        this.setState((s) => ({
          reflections: { ...s.reflections, [id!]: (s.reflections[id!] || []).concat(t ? [{ text: t, date: 'Just now' }] : []) },
          composeFor: null, composeText: '', composeRecording: false,
        }))
      },
      onCancel: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ composeFor: null, composeText: '', composeRecording: false }) },
      stop: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation() },
    }
  }

  buildEntryView(ev: Any): Any {
    if (!ev) return null
    const close = (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ entryOpen: null }) }
    const stopE = (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation() }
    if (ev.kind === 'reflection') {
      return { eyebrow: 'Your reflection', footer: 'a note from your practice', date: ev.date, before: ev.text, phrase: '', after: '', onClose: close, stop: stopE, canOpen: false, noOpen: true, backCol: '#8A5A30', backLabel: 'Back to the insight' }
    }
    const entry = ENTRIES[ev.e]
    const text = entry.text
    const q = ev.q
    const idx = text.indexOf(q)
    const canOpen = ev.e === 'mar6'
    return {
      eyebrow: 'Your entry', footer: 'where this was noticed', date: entry.date,
      before: idx >= 0 ? text.slice(0, idx) : text, phrase: idx >= 0 ? q : '', after: idx >= 0 ? text.slice(idx + q.length) : '',
      onClose: close, stop: stopE, canOpen, noOpen: !canOpen, backCol: canOpen ? '#A8A095' : '#8A5A30',
      backLabel: this.state.entryFrom === 'entries' ? 'Close' : 'Back to the insight',
      onOpenFull: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mode: 'detail', entryOpen: null, openId: null, drill: null }) },
    }
  }

  chipView(id: string): Any {
    const c = CHIPS[id]
    const added = !!this.state.added[id]
    const active = this.state.drill && this.state.drill.id === id
    const owned = c.owned || added
    let bg: string, color: string, border: string
    if (owned) {
      if (active) { bg = '#8A5A30'; color = '#F8F7F4'; border = '1px solid #8A5A30' }
      else { bg = '#FFFFFF'; color = '#4A4540'; border = '1px solid #DDD9D0' }
    } else {
      if (active) { bg = '#EFE6D8'; color = '#6B4A26'; border = '1px solid #C7A877' }
      else { bg = 'transparent'; color = '#9A8E7C'; border = '1px dashed #D8CFBF' }
    }
    return {
      key: id, label: c.label, bg, color, border,
      onTap: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState((s) => ({ drill: s.drill && s.drill.id === id ? null : { kind: c.kind, id } })) },
    }
  }

  buildDetail(): Any {
    const drill = this.state.drill || ({} as { kind?: string; id?: string })
    const amber = 'rgba(138,90,48,.14)'
    const bgFor = (id: string) => (drill.id === id ? amber : 'transparent')
    const feelOwnedIds = ['anxious', 'tired'].concat(this.state.added.braced ? ['braced'] : [])
    const mentionOwnedIds = ['maya'].concat(this.state.added.deadline ? ['deadline'] : [])
    const feelSugIds = this.state.added.braced ? [] : ['braced']
    const mentionSugIds = this.state.added.deadline ? [] : ['deadline']
    const dpFor = (id?: string) => {
      if (!id || !CHIPS[id]) return null
      const c = CHIPS[id]
      const owned = c.owned || this.state.added[id]
      return {
        eyebrow: owned ? 'From your words' : 'Inyeon noticed this here',
        eyebrowCol: owned ? '#908A80' : '#B0936A',
        quote: c.quote, isSug: !owned, isOwned: !!owned,
        onAdd: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState((s) => ({ added: { ...s.added, [id]: true }, drill: null })) },
      }
    }
    const dpFeel = drill.kind === 'feel' ? dpFor(drill.id) : null
    const dpMention = drill.kind === 'mention' ? dpFor(drill.id) : null
    const go = (patch: Partial<State>) => (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ drill: null, ...patch }) }
    return {
      bgMaya: bgFor('maya'), bgDread: bgFor('anxious'), bgRehearse: bgFor('braced'), bgDeadline: bgFor('deadline'), bgExhausted: bgFor('tired'),
      bgShoulders: drill.kind === 'evidence' ? amber : 'transparent',
      scopeOpen: drill.kind === 'scope', evOpen: drill.kind === 'evidence',
      onScope: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState((s) => ({ drill: s.drill && s.drill.kind === 'scope' ? null : { kind: 'scope' } })) },
      onEvidence: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState((s) => ({ drill: s.drill && s.drill.kind === 'evidence' ? null : { kind: 'evidence' } })) },
      onDone: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ drill: null }) },
      onBack: go({ mode: 'entries' }),
      onOpenTree: go({ mode: 'intention', intent: 'A' }),
      onOpenA4: go({ mode: 'intention', intent: 'A', openId: 'a4', touched: true }),
      onSeeGrowing: go({ mode: 'intention', intent: 'A', focusBeckon: 'a1' }),
      feelChips: feelOwnedIds.map((id) => this.chipView(id)),
      feelSugs: feelSugIds.map((id) => this.chipView(id)),
      sugFeelShow: feelSugIds.length > 0,
      mentionChips: mentionOwnedIds.map((id) => this.chipView(id)),
      mentionSugs: mentionSugIds.map((id) => this.chipView(id)),
      sugMentionShow: mentionSugIds.length > 0,
      dpFeelOpen: !!dpFeel, dpFeel: dpFeel || {}, dpMentionOpen: !!dpMention, dpMention: dpMention || {},
      mirrorKeepLabel: this.state.mirrorKept ? 'Kept ✓' : 'Keep',
      mirrorKeepCol: this.state.mirrorKept ? '#9A8E7C' : '#8A5A30',
      mirrorKeepLine: this.state.mirrorKept ? 'none' : '1px solid #8A5A30',
      onMirrorKeep: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mirrorKept: true }) },
      insightKept: this.state.insightKept, insightUnkept: !this.state.insightKept,
      onInsightKeep: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ insightKept: true }) },
      qcardOffer: this.state.qcard === 'offer', qcardAttached: this.state.qcard === 'attached',
      onAttach: (e: EventLike) => {
        if (e && e.stopPropagation) e.stopPropagation()
        this.setState((s) => ({ qcard: 'attached', reflections: { ...s.reflections, a4: (s.reflections.a4 || []).concat([{ text: 'The whole time my shoulders were up by my ears. Afterward I noticed I was exhausted, not from the meeting, but from carrying all of it for days before.', date: 'Thursday, March 6' }]) } }))
      },
      onQDismiss: (e: EventLike) => {
        if (e && e.stopPropagation) e.stopPropagation()
        // Degrowth: three consecutive dismissals rest prompt delivery for 7 days.
        this.setState((s) => {
          const n = s.promptDismissals + 1
          const resting = n >= 3
          return { qcard: 'dismissed', promptDismissals: resting ? 0 : n, promptsRestingUntil: resting ? Date.now() + 7 * 864e5 : s.promptsRestingUntil }
        })
      },
      saveLabel: this.state.savedRef ? 'Saved ✓' : 'Save reflection',
      saveCol: this.state.savedRef ? '#9A8E7C' : '#8A5A30',
      saveLine: this.state.savedRef ? 'none' : '1px solid #8A5A30',
      onSaveRef: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ savedRef: true, mode: 'entries', drill: null, entryOpen: null, openId: null }) },
    }
  }

  renderVals(): Any {
    const { mode, intent, openId, hoverId, touched } = this.state
    const effMode = mode === 'intention' && !this.state.forms[intent] ? 'choosing' : mode
    const I = INTENTIONS[intent]
    const form = this.formOf(intent)
    const skel = this.skel(form)
    const stroke = this.TH()[form]
    const pos = this.pos(intent, form, I.nodes)
    const tiers = this.tiers(form)
    const beckonId = this.state.focusBeckon || (touched ? null : (I.nodes.find((n) => this.qstatusOf(intent, n) === 'open' && n.m === 'evidenced') || ({} as Any)).id)
    const nodes = I.nodes.map((n) => this.nodeView(n, pos[n.id] || skel.root, intent, hoverId, beckonId))
    const panel = openId ? this.buildPanel(intent, I.nodes.find((n) => n.id === openId)!) : null
    const entry = this.state.entryOpen ? this.buildEntryView(this.state.entryOpen) : null
    const compose = this.state.composeFor ? this.buildCompose() : null
    const choices = FORMS.map((f) => ({ key: f.id, label: f.label, hint: FORMHINT[f.id], onTap: this.chooseForm(f.id) }))
    const originStr = skel.root.x / 10 + '% ' + skel.root.y / 10 + '%'
    const groupAnim = form === 'tree' ? 'sway 7s ease-in-out infinite' : form === 'lung' ? 'lungbreath 5s ease-in-out infinite' : 'none'
    return {
      intentionMode: effMode === 'intention', forestMode: mode === 'forest', choosingMode: effMode === 'choosing', detailMode: mode === 'detail',
      ob1Mode: mode === 'ob1', ob2Mode: mode === 'ob2', ob3Mode: mode === 'ob3', ob4Mode: mode === 'ob4', ob5Mode: mode === 'ob5', ob6Mode: mode === 'ob6', ob7Mode: mode === 'ob7',
      breathMode: mode === 'breath', speakMode: mode === 'speak', entriesMode: mode === 'entries', settingsMode: mode === 'settings',
      promptShow: !this.state.promptGone && this.state.delivery === 'open',
      ...this.buildApp(),
      nav: {
        ob1: this.go('ob1'), ob2: this.go('ob2'), ob3: this.go('ob3'), ob4: this.go('ob4'), ob5: this.go('ob5'), ob6: this.go('ob6'),
        speak: this.go('speak'), entries: this.go('entries'), settings: this.go('settings'), detail: this.go('detail'),
        breathToMirror: this.go('breath', { breathTo: 'ob7' }), breathToDetail: this.go('breath', { breathTo: 'detail' }),
        breathDone: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mode: this.state.breathTo || 'detail' }) },
        insightA4: this.go('intention', { intent: 'A', openId: 'a4', touched: true }),
        seeFirstBud: this.go('intention', { intent: 'A', focusBeckon: 'a1' }),
        intentA: this.go('intention', { intent: 'A' }), intentB: this.go('intention', { intent: 'B' }), intentC: this.go('intention', { intent: 'C' }),
        dismissPrompt: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ promptGone: true }) },
        keepFirst: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ obKept: true }) },
      },
      detail: this.buildDetail(),
      panelOpen: !!panel && effMode === 'intention', panel, entryPanelOpen: !!entry, entry, composeOpen: !!compose, compose,
      nodes, guideShow: effMode === 'intention' && !touched, hintShow: effMode === 'intention' && !this.state.hintSeen,
      pThick: tiers.thick, pMid: tiers.mid, pThin: tiers.thin,
      auraCol: stroke.aura, coreCol: stroke.core,
      wThick: stroke.w[0], wMid: stroke.w[1], wThin: stroke.w[2],
      awThick: stroke.aw[0], awMid: stroke.aw[1], awThin: stroke.aw[2],
      flowD: form === 'river' ? (tiers.thick + ' ' + tiers.mid) : '', flowStroke: form === 'river' ? '#E6C88E' : 'transparent',
      flowAnim: form === 'river' ? 'flowdash 1.5s linear infinite' : 'none',
      center: { leftPct: skel.root.x / 10, topPct: skel.root.y / 10 }, intentLabel: I.label,
      originStr, groupAnim, choices, formHint: FORMHINT[form],
      formLabel: (FORMS.find((f) => f.id === form) || ({} as Any)).label,
      reChoose: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mode: 'choosing' }) },
      dismissHint: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ hintSeen: true }) },
      forest: this.buildForest(),
      svgOpacity: hoverId ? 0.5 : 1, noop: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation() },
      onBgClick: (e: Any) => { if (e && e.target === e.currentTarget && this.state.mode === 'intention') this.setState((s) => ({ barShown: !s.barShown })) },
      barShown: this.state.barShown && effMode === 'intention', barHidden: !this.state.barShown,
      toForest: (e: EventLike) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ mode: 'forest', openId: null, hoverId: null }) },
    }
  }
}

export const logic = new Logic()
