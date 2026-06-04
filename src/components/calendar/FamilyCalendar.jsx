import { useState, useCallback, useMemo } from 'react'
import Calendar from 'react-calendar'
import { v4 as uuidv4 } from 'uuid'
import EventModal from './EventModal'
import WorkPatternModal from './WorkPatternModal'
import MemberFilterChips from './MemberFilterChips'
import DayDetailSheet from './DayDetailSheet'
import { loadEvents, saveEvents, getEventsForDate } from '../../utils/storage'
import { getWorkStatus, loadWorkPattern } from '../../utils/workPattern'
import { MEMBERS, getMember } from '../../constants/members'

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

const WEEK = ['일','월','화','수','목','금','토']

function greet() {
  const h = new Date().getHours()
  if (h < 6)  return '🌙 좋은 새벽이에요'
  if (h < 12) return '🌞 좋은 아침이에요'
  if (h < 17) return '☀️ 좋은 오후예요'
  if (h < 21) return '🌆 좋은 저녁이에요'
  return '🌙 오늘도 수고했어요'
}

export default function FamilyCalendar() {
  const [events, setEvents]             = useState(loadEvents)
  const [activeFilters, setActiveFilters] = useState(new Set(MEMBERS.map(m => m.name)))
  const [selectedDate, setSelectedDate] = useState(null)   // 시트에 표시할 날짜
  const [sheetOpen, setSheetOpen]       = useState(false)  // 시트 열림 여부
  const [eventModal, setEventModal]     = useState(null)
  const [showWorkModal, setShowWorkModal] = useState(false)
  const [workKey, setWorkKey]           = useState(0)

  const hasWorkPattern = !!loadWorkPattern()
  const filterKey = [...activeFilters].sort().join(',')

  function matchesFilter(ev) {
    const parts = ev.participants ?? (ev.member ? [ev.member] : ['엄마'])
    return parts.some(p => activeFilters.has(p))
  }

  const filteredEvents = useMemo(() => events.filter(matchesFilter), [events, filterKey])

  function handleSave(data) {
    let updated
    if (eventModal?.event) {
      updated = events.map(e => e.id === eventModal.event.id ? { ...e, ...data } : e)
    } else {
      updated = [...events, { id: uuidv4(), comments: [], ...data }]
    }
    setEvents(updated)
    saveEvents(updated)
    setEventModal(null)
  }

  function handleDelete(id) {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    saveEvents(updated)
    setEventModal(null)
    setSheetOpen(false)
  }

  /** 캘린더 날짜 클릭 → 시트 열기 */
  function handleDateClick(date) {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  /** 시트에서 일정 추가 클릭 */
  function handleAddFromSheet() {
    setSheetOpen(false)
    setEventModal({ mode: 'add' })  // selectedDate 유지 → EventModal이 그 날짜 사용
  }

  /** 헤더 '+' 클릭 */
  function handleAddFromHeader() {
    setSheetOpen(false)
    setSelectedDate(null)
    setEventModal({ mode: 'add' })
  }

  const tileContent = useCallback(({ date, view }) => {
    if (view !== 'month') return null
    const str = toDateStr(date)
    const dayEvts = getEventsForDate(str, filteredEvents)
    const work = getWorkStatus(date)

    const colors = []
    dayEvts.forEach(ev => {
      const parts = ev.participants ?? [ev.member]
      parts.forEach(p => {
        const c = getMember(p).color
        if (!colors.includes(c)) colors.push(c)
      })
    })

    return (
      <>
        {work && (
          <span className="work-badge" style={{ background: work.bg, color: work.color }}>
            {work.emoji}
          </span>
        )}
        {colors.length > 0 && (
          <div className="event-dots">
            {colors.slice(0, 4).map((c, i) => (
              <span key={i} className="event-dot" style={{ background: c }} />
            ))}
          </div>
        )}
      </>
    )
  }, [filteredEvents, workKey])

  const selectedDateEvents = (selectedDate && sheetOpen)
    ? getEventsForDate(toDateStr(selectedDate), filteredEvents)
    : []

  return (
    <div className="flex flex-col min-h-full">

      {/* ── 헤더 ── */}
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: 'linear-gradient(135deg, #5CB370 0%, #4A9B8C 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-black text-lg">우리 가족 💚</p>
            <p className="text-white/75 text-xs">{greet()}</p>
          </div>

          {/* 우측 버튼 그룹 */}
          <div className="flex items-center gap-2">
            {/* 일정 추가 버튼 */}
            <button
              onClick={handleAddFromHeader}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
              title="일정 추가"
            >+</button>

            {/* 근무패턴 버튼 */}
            <button
              onClick={() => setShowWorkModal(true)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <span className="text-base">👨</span>
              <span className="text-xs font-bold text-white" style={{ lineHeight: 1 }}>
                {hasWorkPattern ? '패턴✓' : '패턴'}
              </span>
            </button>
          </div>
        </div>

        {/* 오늘 근무 요약 */}
        {(() => {
          const ws = getWorkStatus(new Date())
          if (!ws) return null
          return (
            <div className="mt-2.5 px-3 py-1.5 rounded-2xl flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <span>{ws.emoji}</span>
              <span className="text-white text-xs font-semibold">
                오늘 아빠 <strong>{ws.label}</strong>
              </span>
            </div>
          )
        })()}
      </div>

      {/* ── 필터 칩 ── */}
      <div className="bg-white border-b" style={{ borderColor: '#E2EEE8' }}>
        <MemberFilterChips active={activeFilters} onChange={setActiveFilters} />
      </div>

      {/* ── 캘린더 ── */}
      <div className="px-4 pt-3">
        <div className="card p-3">
          <Calendar
            locale="ko"
            value={selectedDate}
            onChange={handleDateClick}
            tileContent={tileContent}
            formatDay={(_, d) => d.getDate()}
            formatShortWeekday={(_, d) => WEEK[d.getDay()]}
          />
        </div>
      </div>

      {/* 요약 */}
      <div className="px-5 pt-3 pb-28">
        <p className="text-xs" style={{ color: '#9CB4A8' }}>
          이번 달 일정 <strong style={{ color: '#5CB370' }}>{filteredEvents.length}개</strong>
          {activeFilters.size < MEMBERS.length && (
            <span> · {[...activeFilters].map(n => getMember(n).emoji).join('')} 필터 중</span>
          )}
        </p>
      </div>

      {/* ── 날짜 시트 ── */}
      {sheetOpen && selectedDate && (
        <DayDetailSheet
          selectedDate={selectedDate}
          events={selectedDateEvents}
          onEdit={ev => { setSheetOpen(false); setEventModal({ mode: 'edit', event: ev }) }}
          onAddEvent={handleAddFromSheet}
          onEventsUpdated={setEvents}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {/* ── 이벤트 모달 ── */}
      {eventModal && (
        <EventModal
          date={selectedDate || new Date()}
          event={eventModal.event}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEventModal(null)}
        />
      )}

      {/* ── 근무패턴 모달 ── */}
      {showWorkModal && (
        <WorkPatternModal
          onClose={() => setShowWorkModal(false)}
          onSaved={() => setWorkKey(k => k+1)}
        />
      )}
    </div>
  )
}
