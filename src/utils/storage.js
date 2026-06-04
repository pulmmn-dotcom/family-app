import { v4 as uuidv4 } from 'uuid'

const KEY = 'family_events'

function migrateEvent(e) {
  return {
    ...e,
    participants: e.participants ?? (e.member ? [e.member] : ['엄마']),
    comments: (e.comments ?? []).map(c => ({
      ...c,
      reactions: c.reactions ?? { like: [], sad: [] },
    })),
    startTime: e.startTime ?? '08:00',
    endTime: e.endTime ?? '09:00',
    location: e.location ?? '',
    repeat: e.repeat ?? 'none',
    endDate: e.endDate ?? e.date,
    allDay: e.allDay ?? false,
  }
}

export function loadEvents() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw).map(migrateEvent) : []
  } catch {
    return []
  }
}

export function saveEvents(events) {
  localStorage.setItem(KEY, JSON.stringify(events))
}

/** 반복 + 날짜 범위를 고려해 해당 날짜의 이벤트 반환 */
export function getEventsForDate(dateStr, events) {
  const target = new Date(dateStr + 'T00:00:00')
  return events.filter(ev => {
    const start = ev.date
    const end = ev.endDate || ev.date

    // 날짜 범위 안에 포함
    if (dateStr >= start && dateStr <= end) return true

    // 반복 (시작일 이후만)
    if (!ev.repeat || ev.repeat === 'none') return false
    const origin = new Date(start + 'T00:00:00')
    if (target <= origin) return false

    switch (ev.repeat) {
      case 'daily':   return true
      case 'weekly':  return origin.getDay() === target.getDay()
      case 'monthly': return origin.getDate() === target.getDate()
      case 'yearly':
        return origin.getMonth() === target.getMonth() &&
               origin.getDate() === target.getDate()
      default: return false
    }
  })
}

export function addComment(eventId, author, text) {
  const events = loadEvents()
  const comment = {
    id: uuidv4(), author, text,
    createdAt: new Date().toISOString(),
    reactions: { like: [], sad: [] },
  }
  const updated = events.map(e =>
    e.id === eventId ? { ...e, comments: [...e.comments, comment] } : e
  )
  saveEvents(updated)
  return updated
}

export function toggleReaction(eventId, commentId, reactionType, memberName) {
  const events = loadEvents()
  const updated = events.map(e => {
    if (e.id !== eventId) return e
    return {
      ...e,
      comments: e.comments.map(c => {
        if (c.id !== commentId) return c
        const arr = c.reactions[reactionType] ?? []
        const next = arr.includes(memberName)
          ? arr.filter(n => n !== memberName)
          : [...arr, memberName]
        return { ...c, reactions: { ...c.reactions, [reactionType]: next } }
      }),
    }
  })
  saveEvents(updated)
  return updated
}
