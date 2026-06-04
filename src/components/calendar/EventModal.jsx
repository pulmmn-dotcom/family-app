import { useState, useEffect } from 'react'
import { MEMBERS, getMember } from '../../constants/members'

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

const REPEAT_OPTIONS = [
  { value: 'none',    label: '반복 안함' },
  { value: 'daily',   label: '1일마다' },
  { value: 'weekly',  label: '1주마다' },
  { value: 'monthly', label: '1개월마다' },
  { value: 'yearly',  label: '1년마다' },
]

const inputCls = {
  border: '1.5px solid #E2EEE8', borderRadius: 12,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  background: '#fff', color: '#1A3A2A', fontFamily: 'inherit',
  width: '100%',
}

function ToggleSwitch({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 transition-all"
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? '#5CB370' : '#D1D5DB',
        border: 'none', cursor: 'pointer',
      }}
    >
      <span
        className="absolute top-0.5 bg-white rounded-full shadow transition-all"
        style={{ width: 20, height: 20, left: on ? 22 : 2 }}
      />
    </button>
  )
}

const Label = ({ children }) => (
  <label className="block text-xs font-bold mb-1.5" style={{ color: '#6B8F7C' }}>
    {children}
  </label>
)

export default function EventModal({ date, event, onSave, onDelete, onClose }) {
  const initDate = toDateStr(date || new Date())

  const [title, setTitle]         = useState('')
  const [startDate, setStartDate] = useState(initDate)
  const [endDate, setEndDate]     = useState(initDate)
  const [allDay, setAllDay]       = useState(false)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime]     = useState('09:00')
  const [location, setLocation]   = useState('')
  const [participants, setParticipants] = useState(new Set(['엄마']))
  const [repeat, setRepeat]       = useState('none')
  const [note, setNote]           = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStartDate(event.date)
      setEndDate(event.endDate || event.date)
      setAllDay(event.allDay ?? false)
      setStartTime(event.startTime || '08:00')
      setEndTime(event.endTime || '09:00')
      setLocation(event.location || '')
      setParticipants(new Set(event.participants ?? (event.member ? [event.member] : ['엄마'])))
      setRepeat(event.repeat || 'none')
      setNote(event.note || '')
    }
  }, [event])

  /** 시작일 변경: 종료일이 시작일보다 앞이면 종료일을 시작일로 맞춤 */
  function handleStartDate(val) {
    setStartDate(val)
    if (endDate < val) setEndDate(val)
  }

  /** 종료일 변경: 시작일보다 앞이면 시작일을 종료일로 맞춤 */
  function handleEndDate(val) {
    setEndDate(val)
    if (val < startDate) setStartDate(val)
  }

  function toggleP(name) {
    setParticipants(prev => {
      const next = new Set(prev)
      if (next.has(name) && next.size === 1) return prev
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handleSave() {
    if (!title.trim()) return
    const list = [...participants]
    onSave({
      title: title.trim(),
      date: startDate,
      endDate,
      allDay,
      startTime: allDay ? '' : startTime,
      endTime:   allDay ? '' : endTime,
      location,
      participants: list,
      color: getMember(list[0]).color,
      repeat,
      note: note.trim(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-3xl bg-white overflow-y-auto"
        style={{ maxHeight: '92vh', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-10">
          {/* 헤더 */}
          <div className="flex items-center justify-between py-3 mb-2">
            <h2 className="text-lg font-bold" style={{ color: '#1A3A2A' }}>
              {event ? '일정 수정' : '새 일정'}
            </h2>
            <button onClick={onClose} className="text-2xl" style={{ color: '#9CB4A8' }}>×</button>
          </div>

          <div className="space-y-4">
            {/* 제목 */}
            <div>
              <Label>제목</Label>
              <input
                autoFocus style={inputCls}
                placeholder="일정 제목"
                value={title} onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* 하루종일 토글 */}
            <div className="flex items-center justify-between py-0.5">
              <span className="text-sm font-bold" style={{ color: '#1A3A2A' }}>하루종일</span>
              <ToggleSwitch on={allDay} onToggle={() => setAllDay(v => !v)} />
            </div>

            {/* 날짜 범위 */}
            <div>
              <Label>날짜</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  style={{ ...inputCls, flex: 1 }}
                  value={startDate}
                  onChange={e => handleStartDate(e.target.value)}
                />
                <span className="font-bold text-sm flex-shrink-0" style={{ color: '#9CB4A8' }}>~</span>
                <input
                  type="date"
                  style={{ ...inputCls, flex: 1 }}
                  value={endDate}
                  onChange={e => handleEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* 시간 — 하루종일 OFF일 때만 표시 */}
            {!allDay && (
              <div>
                <Label>시간</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    style={{ ...inputCls, flex: 1 }}
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: '#9CB4A8' }}>~</span>
                  <input
                    type="time"
                    style={{ ...inputCls, flex: 1 }}
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 장소 */}
            <div>
              <Label>장소 (선택)</Label>
              <input
                style={inputCls} placeholder="📍 장소"
                value={location} onChange={e => setLocation(e.target.value)}
              />
            </div>

            {/* 참여자 */}
            <div>
              <Label>참여자</Label>
              <div className="flex gap-3 justify-around">
                {MEMBERS.map(m => {
                  const on = participants.has(m.name)
                  return (
                    <button key={m.name} onClick={() => toggleP(m.name)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="relative flex items-center justify-center rounded-full text-3xl transition-all"
                        style={{
                          width: 60, height: 60,
                          background: on ? m.color : '#F4FAF6',
                          border: `2.5px solid ${on ? m.color : '#E2EEE8'}`,
                          boxShadow: on ? `0 4px 12px ${m.color}55` : 'none',
                          transform: on ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        {m.emoji}
                        {on && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: '#5CB370', fontSize: 10, fontWeight: 900 }}
                          >✓</span>
                        )}
                      </div>
                      <span className="text-xs font-bold" style={{ color: on ? m.textColor : '#9CB4A8' }}>
                        {m.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 반복 */}
            <div>
              <Label>반복</Label>
              <div className="flex gap-1.5 flex-wrap">
                {REPEAT_OPTIONS.map(opt => (
                  <button
                    key={opt.value} onClick={() => setRepeat(opt.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: repeat === opt.value ? '#5CB370' : '#F4FAF6',
                      color: repeat === opt.value ? '#fff' : '#6B8F7C',
                      border: `1.5px solid ${repeat === opt.value ? '#5CB370' : '#E2EEE8'}`,
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <Label>메모 (선택)</Label>
              <textarea
                style={{ ...inputCls, resize: 'none' }} rows={2}
                placeholder="메모"
                value={note} onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2.5 mt-5">
            {event && (
              <button onClick={() => onDelete(event.id)}
                className="px-4 py-3 rounded-2xl text-sm font-bold"
                style={{ background: '#FFF0F3', color: '#E91E63', border: '1.5px solid #FFD6E3' }}>
                삭제
              </button>
            )}
            <button onClick={handleSave} disabled={!title.trim()}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: title.trim() ? 'linear-gradient(135deg,#5CB370,#4A9B8C)' : '#D1D5DB' }}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
