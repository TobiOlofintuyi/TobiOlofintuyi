import { s } from '../css'
import type { Vals } from './types'

type IconKind = 'journal' | 'entries' | 'insights' | 'settings'

function Icon({ kind, color }: { kind: IconKind; color: string }) {
  const round = s(`stroke:${color}; stroke-width:2; stroke-linecap:round; stroke-linejoin:round`)
  const cap = s(`stroke:${color}; stroke-width:2; stroke-linecap:round`)
  if (kind === 'journal')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M6 11a6 6 0 0 0 12 0" />
        <line x1="12" y1="18" x2="12" y2="21" />
      </svg>
    )
  if (kind === 'entries')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={cap} aria-hidden="true">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="16" y2="12" />
        <line x1="4" y1="18" x2="12" y2="18" />
      </svg>
    )
  if (kind === 'insights')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={round} aria-hidden="true">
        <path d="M12 21V9" />
        <path d="M12 13L7.5 8.5" />
        <path d="M12 9L16.5 4.5" />
        <circle cx="7.5" cy="8.5" r="1.4" fill={color} stroke="none" />
        <circle cx="16.5" cy="4.5" r="1.4" fill={color} stroke="none" />
      </svg>
    )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={cap} aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4v2.4M12 17.6V20M4 12h2.4M17.6 12H20M6.3 6.3l1.7 1.7M16 16l1.7 1.7M17.7 6.3L16 8M8 16l-1.7 1.7" />
    </svg>
  )
}

function Tab({ label, kind, color, active, onClick }: { label: string; kind: IconKind; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hit"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      style={s('display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:none; cursor:pointer; padding:0')}
    >
      <Icon kind={kind} color={color} />
      <span style={s(`font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:.08em; text-transform:uppercase; color:${color}`)}>{label}</span>
    </button>
  )
}

export function TabBar({ v, variant, active, pos }: { v: Vals; variant: 'light' | 'landscape'; active: IconKind; pos?: string }) {
  const th = v.th
  const idle = variant === 'landscape' ? '#8C7355' : '#A8A095'
  const on = variant === 'landscape' ? th.tabHi : '#8A5A30'
  const col = (k: IconKind) => (active === k ? on : idle)
  const box =
    variant === 'landscape'
      ? `background:${th.chip}; border:1px solid ${th.chipBd}; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px)`
      : `background:#FFFFFF; border:1px solid #E4DFD5; box-shadow:0 14px 34px -22px rgba(40,32,24,.4)`
  return (
    <nav
      aria-label="Primary"
      style={s(`${pos || ''}; display:flex; justify-content:space-between; align-items:center; border-radius:999px; padding:10px 22px; ${box}`)}
    >
      <Tab label="Journal" kind="journal" color={col('journal')} active={active === 'journal'} onClick={v.nav.speak} />
      <Tab label="Entries" kind="entries" color={col('entries')} active={active === 'entries'} onClick={v.nav.entries} />
      <Tab label="Insights" kind="insights" color={col('insights')} active={active === 'insights'} onClick={v.toForest} />
      <Tab label="Settings" kind="settings" color={col('settings')} active={active === 'settings'} onClick={v.nav.settings} />
    </nav>
  )
}
