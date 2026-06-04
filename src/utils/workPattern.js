const KEY = 'work_pattern'

export const PRESETS = [
  { label: '주휴야휴 (4일 반복)', pattern: ['주간', '휴무', '야간', '휴무'] },
  { label: '주야비비 (4일 반복)', pattern: ['주간', '야간', '비번', '비번'] },
  { label: '주야비 (3일 반복)', pattern: ['주간', '야간', '비번'] },
  { label: '주야 (2일 반복)', pattern: ['주간', '야간'] },
]

export const STATUS_STYLE = {
  주간: { label: '주간', bg: '#FFF3E0', color: '#E65100', emoji: '☀️' },
  야간: { label: '야간', bg: '#EDE7F6', color: '#6A1B9A', emoji: '🌙' },
  휴무: { label: '휴무', bg: '#E8F5E9', color: '#2E7D32', emoji: '🏠' },
  비번: { label: '비번', bg: '#E8F5E9', color: '#2E7D32', emoji: '🏠' },
}

function dateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export function loadWorkPattern() {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}
export function saveWorkPattern(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}
export function clearWorkPattern() {
  localStorage.removeItem(KEY)
}

export function getWorkStatus(date) {
  const wp = loadWorkPattern()
  if (!wp) return null
  const start = new Date(wp.startDate + 'T00:00:00')
  const target = new Date(dateStr(date) + 'T00:00:00')
  const diff = Math.round((target - start) / 86400000)
  if (diff < 0) return null
  const key = wp.pattern[diff % wp.pattern.length]
  return key ? { key, ...STATUS_STYLE[key] } : null
}
