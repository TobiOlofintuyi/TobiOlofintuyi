// All content + tuning constants, ported verbatim from the canonical
// End-to-End design. These are the demo "practice" the app ships with; the
// shapes here are the data contract the fractal + detail screens read from.

export type FormId = 'tree' | 'river' | 'lung'
export type Maturity = 'bud' | 'growing' | 'evidenced'
export type QStatus = 'open' | 'practice' | 'integrated'

export interface Stroke {
  core: string
  aura: string
  w: [number, number, number]
  aw: [number, number, number]
}

export const STROKE: Record<FormId, Stroke> = {
  tree: { core: '#C99A46', aura: 'rgba(201,154,70,0.30)', w: [5, 3, 1.6], aw: [13, 8, 5] },
  river: { core: '#BFA06A', aura: 'rgba(191,160,106,0.30)', w: [6, 3.4, 1.8], aw: [15, 9, 5] },
  lung: { core: '#C88A72', aura: 'rgba(200,138,114,0.30)', w: [4.6, 2.8, 1.5], aw: [12, 7, 4.5] },
}

export const STROKE_LIGHT: Record<FormId, Stroke> = {
  tree: { core: '#9A6A28', aura: 'rgba(120,78,28,0.20)', w: [5, 3, 1.6], aw: [13, 8, 5] },
  river: { core: '#8C6A3C', aura: 'rgba(110,80,44,0.20)', w: [6, 3.4, 1.8], aw: [15, 9, 5] },
  lung: { core: '#9E5E46', aura: 'rgba(130,70,52,0.20)', w: [4.6, 2.8, 1.5], aw: [12, 7, 4.5] },
}

export const FORMS: { id: FormId; label: string }[] = [
  { id: 'tree', label: 'Tree' },
  { id: 'river', label: 'River' },
  { id: 'lung', label: 'Lung' },
]

export const FORMHINT: Record<FormId, string> = {
  tree: 'For the growth you are reaching toward.',
  river: 'For what you are ready to let move and settle.',
  lung: 'For what you return to, breath by breath.',
}

export const SHAPELABEL: Record<string, string> = {
  loop: 'A loop, noticed',
  mirroredwords: 'Your words, mirrored',
  contrast: 'A contrast, held',
  somaticbeat: 'What the body said first',
  openquestion: 'An open question',
  thenvsnow: 'Then, and now',
  growtharc: 'Something growing',
  self_experiment: 'An experiment to try',
}

export const QMODE: Record<string, string> = {
  loop: 'live out',
  mirroredwords: 'notice',
  contrast: 'live out',
  somaticbeat: 'notice',
  openquestion: 'sit with',
  thenvsnow: 'live out',
  growtharc: 'live out',
  self_experiment: 'live out',
}

export const QNODE: Record<string, string> = {
  a1: 'When you notice yourself bracing this week, could you pause and offer yourself the ease you would offer a friend?',
  a2: 'Next time you feel tired, could you ask whether it is the task or the bracing, and let yourself set one down?',
  a3: 'When someone is gentler than you expected, could you let yourself receive it instead of bracing?',
  a4: 'Once today, when your shoulders rise, could you soften them and name what you are feeling?',
  a6: 'Could you rest once this week without earning it first, and let that be enough?',
  a7: 'When a silence falls this week, could you let it be a silence, and stay gently with the person?',
  a8: 'Once today, could you say what you feel out loud, and meet it with kindness?',
  a9: 'When you feel stuck this week, could you take a cold walk and let it move you?',
  b1: 'When sorry rises to fill a silence this week, could you let the pause stand instead?',
  b2: 'When the room gets loud, could you notice your voice shrinking and take one full breath before you speak?',
  b3: 'Could you ask for one thing you want this week, and let it be allowed?',
  b4: 'When a pause comes, could you let it be a pause without rushing to fill it?',
  b5: 'Could you move through one room this week as if you already belonged?',
  c1: 'Could you let someone in a little this week before you are certain of them?',
  c2: 'Could you let someone see the tired version of you, and trust it is enough?',
  c3: 'When you catch yourself auditing someone this week, could you choose to trust them a little?',
  c4: 'Who is one person you could let in a little more this week?',
}

export const QTEMPLATES: Record<string, string> = {
  loop: 'When the loop starts again, what is one true thing you could say out loud?',
  mirroredwords: 'Next time you feel tired, is it because of the thing itself, or the bracing?',
  contrast: 'Where might someone be gentler with you than you expect?',
  somaticbeat: 'What is your body telling you before you find the words?',
  openquestion: 'What would rest feel like if you did not have to earn it?',
  thenvsnow: 'When the old reflex shows up, what could the new one say instead?',
  growtharc: 'What is the smallest version of this you could try today?',
  self_experiment: 'What might change if you actually tried it this week?',
}

export interface EntryRecord {
  date: string
  text: string
}

export const ENTRIES: Record<string, EntryRecord> = {
  mar6: { date: 'Thursday, March 6', text: "I had the review with Maya today and I had been dreading it all week. I barely slept, rehearsing what I would say if she brought up the deadline I missed. And then she did not even mention it. She asked how I was doing, like actually doing, and I did not know what to say. The whole time my shoulders were up by my ears. Afterward I noticed I was exhausted, not from the meeting, but from carrying all of it for days before. I keep preparing for the worst version of people, and then I am surprised when they are kind." },
  mar2: { date: 'Sunday, March 2', text: "Woke up tired again and almost did not write. I went for a cold walk and the air kind of woke me up. By the time I got back I actually wanted to start working." },
  feb27: { date: 'Thursday, February 27', text: "Dad called while I was walking back and I let it go to voicemail again, which I always feel bad about." },
  feb20: { date: 'Thursday, February 20', text: "I kept saying sorry in the meeting even though I had not done anything wrong. It was just filling the silence." },
  mar1: { date: 'Saturday, March 1', text: "I asked for what I wanted for once and it did not cost me the room. Nobody minded at all." },
}

export interface Evidence {
  e: string
  q: string
}

export const EV: Record<string, Evidence[]> = {
  a1: [{ e: 'mar6', q: 'preparing for the worst version of people' }, { e: 'feb27', q: 'let it go to voicemail again' }],
  a2: [{ e: 'mar6', q: 'exhausted, not from the meeting, but from carrying all of it for days before' }, { e: 'mar2', q: 'Woke up tired again' }],
  a3: [{ e: 'mar6', q: 'surprised when they are kind' }, { e: 'mar1', q: 'Nobody minded at all' }],
  a4: [{ e: 'mar6', q: 'my shoulders were up by my ears' }, { e: 'mar6', q: 'I barely slept' }],
  a5: [{ e: 'feb27', q: 'let it go to voicemail again' }],
  a6: [{ e: 'mar2', q: 'Woke up tired again' }, { e: 'mar6', q: 'carrying all of it for days before' }],
  a7: [{ e: 'mar6', q: 'She asked how I was doing, like actually doing' }],
  a8: [{ e: 'mar6', q: 'I did not know what to say' }],
  a9: [{ e: 'mar2', q: 'went for a cold walk and the air kind of woke me up' }, { e: 'mar2', q: 'By the time I got back I actually wanted to start working' }],
  b1: [{ e: 'feb20', q: 'saying sorry in the meeting even though I had not done anything wrong' }],
  b2: [{ e: 'feb20', q: 'filling the silence' }],
  b3: [{ e: 'mar1', q: 'it did not cost me the room' }],
  b4: [{ e: 'mar1', q: 'Nobody minded at all' }],
  b5: [{ e: 'mar1', q: 'asked for what I wanted' }],
  c1: [{ e: 'mar1', q: 'asked for what I wanted' }],
  c2: [{ e: 'mar6', q: 'like actually doing' }],
  c3: [{ e: 'mar1', q: 'Nobody minded at all' }],
  c4: [{ e: 'mar6', q: 'surprised when they are kind' }],
}

export interface InsightNode {
  id: string
  shape: string
  q: QStatus
  m: Maturity
  body: string
  bringOwn?: boolean
  ownQ?: string
}

export interface Intention {
  label: string
  form: FormId
  stage: string
  stageColor: string
  nodes: InsightNode[]
}

export const INTENTIONS: Record<string, Intention> = {
  A: {
    label: 'Learn the language my body already speaks',
    form: 'tree', stage: 'active', stageColor: '#D0A566',
    nodes: [
      { id: 'a1', shape: 'loop', q: 'open', m: 'growing', body: 'I keep preparing for a fight that isn’t coming.' },
      { id: 'a2', shape: 'mirroredwords', q: 'open', m: 'growing', body: 'The exhaustion came from the days of bracing, not the thing I was dreading.' },
      { id: 'a3', shape: 'contrast', q: 'open', m: 'evidenced', body: 'I brace for the worst version of people, then their kindness surprises me.' },
      { id: 'a4', shape: 'somaticbeat', q: 'practice', m: 'evidenced', body: 'My shoulders tell me I’m scared before I have the words.' },
      { id: 'a5', shape: 'loop', q: 'open', m: 'growing', bringOwn: true, ownQ: 'When I have a little to give, could I call Dad back?', body: 'I go quiet with Dad when I feel I owe him something.' },
      { id: 'a6', shape: 'openquestion', q: 'practice', m: 'bud', body: 'Rest feels like something I have to earn.' },
      { id: 'a7', shape: 'thenvsnow', q: 'integrated', m: 'evidenced', body: 'I used to read silence as anger. Now I can wait inside it.' },
      { id: 'a8', shape: 'growtharc', q: 'integrated', m: 'growing', body: 'Naming the feeling makes it smaller.' },
      { id: 'a9', shape: 'self_experiment', q: 'practice', m: 'bud', body: 'A cold walk resets me more than an hour of planning.' },
    ],
  },
  B: {
    label: 'Stop apologizing for taking up space',
    form: 'river', stage: 'settling', stageColor: '#B08A66',
    nodes: [
      { id: 'b1', shape: 'mirroredwords', q: 'practice', m: 'evidenced', body: 'I say sorry to fill the silence, not because I did anything wrong.' },
      { id: 'b2', shape: 'somaticbeat', q: 'practice', m: 'growing', body: 'My voice gets quieter the moment the room gets louder.' },
      { id: 'b3', shape: 'contrast', q: 'integrated', m: 'evidenced', body: 'Asking for what I wanted didn’t cost me the room.' },
      { id: 'b4', shape: 'thenvsnow', q: 'integrated', m: 'growing', body: 'I can let a pause be a pause now.' },
      { id: 'b5', shape: 'openquestion', q: 'open', m: 'bud', body: 'What would I say if I assumed I already belonged here?' },
    ],
  },
  C: {
    label: 'Let people in before I’m sure of them',
    form: 'lung', stage: 'integrated, at rest', stageColor: '#7E6748',
    nodes: [
      { id: 'c1', shape: 'growtharc', q: 'integrated', m: 'evidenced', body: 'Certainty was never the price of closeness.' },
      { id: 'c2', shape: 'contrast', q: 'integrated', m: 'evidenced', body: 'I let Maya see the tired version of me, and it was fine.' },
      { id: 'c3', shape: 'mirroredwords', q: 'integrated', m: 'growing', body: 'Trust built faster once I stopped auditing it.' },
      { id: 'c4', shape: 'openquestion', q: 'open', m: 'bud', body: 'Who have I not let in yet?' },
    ],
  },
}

export const ORDER = ['A', 'B', 'C']

export interface Chip {
  kind: 'feel' | 'mention'
  label: string
  owned: boolean
  quote: string
}

export const CHIPS: Record<string, Chip> = {
  anxious: { kind: 'feel', label: 'anxious', owned: true, quote: 'I had been dreading it all week' },
  tired: { kind: 'feel', label: 'tired', owned: true, quote: 'I was exhausted, not from the meeting' },
  braced: { kind: 'feel', label: 'braced', owned: false, quote: 'rehearsing what I would say' },
  maya: { kind: 'mention', label: 'Maya', owned: true, quote: 'I had the review with Maya today' },
  deadline: { kind: 'mention', label: 'the deadline', owned: false, quote: 'if she brought up the deadline I missed' },
}

// Onboarding intention options + rhythm options + entries feed (from buildApp).
export const OBOPTS: { k: string; label: string; own?: boolean }[] = [
  { k: 'u', label: 'Understand myself better' },
  { k: 'body', label: 'Learn the language my body already speaks' },
  { k: 'p', label: 'Process difficult emotions' },
  { k: 'own', label: 'In my own words…', own: true },
]

export const RH: { k: string; label: string; sub: string }[] = [
  { k: 'am', label: 'Morning', sub: 'before the day begins' },
  { k: 'mid', label: 'Midday', sub: 'a pause in the middle' },
  { k: 'eve', label: 'Evening', sub: 'wind down and let it settle' },
]

export interface EntryCard {
  k: string
  month: string
  date: string
  dur: string
  text: string
  chips: [string, string]
  e: string
  detail?: boolean
}

export const CARDS: EntryCard[] = [
  { k: 'm6', month: 'March', date: 'Thursday, March 6', dur: '2:04', text: 'I had the review with Maya today and I had been dreading it all week…', chips: ['anxious', 'tired'], e: 'mar6', detail: true },
  { k: 'm2', month: 'March', date: 'Sunday, March 2', dur: '1:12', text: 'Woke up tired again and almost did not write. I went for a cold walk…', chips: ['tired', 'lighter'], e: 'mar2' },
  { k: 'm1', month: 'March', date: 'Saturday, March 1', dur: '1:38', text: 'I asked for what I wanted for once and it did not cost me the room…', chips: ['steady', 'allowed'], e: 'mar1' },
  { k: 'f27', month: 'February', date: 'Thursday, February 27', dur: '0:52', text: 'Dad called while I was walking back and I let it go to voicemail again…', chips: ['quiet', 'guilty'], e: 'feb27' },
]
