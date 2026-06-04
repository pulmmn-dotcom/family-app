import { useState } from 'react'
import { MEMBERS, getMember } from '../../constants/members'
import { addComment, toggleReaction } from '../../utils/storage'

const WEEK = ['일','월','화','수','목','금','토']

const REPEAT_LABEL = { daily:'매일', weekly:'매주', monthly:'매월', yearly:'매년' }

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return '방금'
  if (s < 3600) return `${Math.floor(s/60)}분 전`
  if (s < 86400) return `${Math.floor(s/3600)}시간 전`
  const d = new Date(iso)
  return `${d.getMonth()+1}월 ${d.getDate()}일`
}

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth()+1}/${d.getDate()}`
}

function EventCard({ event, onEdit, onEventsUpdated }) {
  const [expanded, setExpanded] = useState(false)
  const [author, setAuthor] = useState(MEMBERS[0])
  const [text, setText] = useState('')

  const parts = event.participants ?? [event.member]
  const isMultiDay = event.endDate && event.endDate !== event.date

  function submitComment() {
    if (!text.trim()) return
    const updated = addComment(event.id, author.name, text.trim())
    setText('')
    onEventsUpdated(updated)
  }

  function handleReaction(commentId, type) {
    const updated = toggleReaction(event.id, commentId, type, author.name)
    onEventsUpdated(updated)
  }

  return (
    <div className="card-sm overflow-hidden mb-3">
      <div className="h-1 w-full" style={{ background: event.color }} />

      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#1A3A2A' }}>{event.title}</p>

            {/* 날짜 범위 */}
            {isMultiDay && (
              <p className="text-xs mt-0.5" style={{ color: '#6B8F7C' }}>
                📆 {shortDate(event.date)} ~ {shortDate(event.endDate)}
              </p>
            )}

            {/* 시간 */}
            {!event.allDay && (event.startTime || event.endTime) && (
              <p className="text-xs mt-0.5" style={{ color: '#6B8F7C' }}>
                🕐 {event.startTime || '--:--'}{event.endTime ? ` ~ ${event.endTime}` : ''}
              </p>
            )}
            {event.allDay && (
              <p className="text-xs mt-0.5" style={{ color: '#9CB4A8' }}>하루종일</p>
            )}

            {/* 장소 */}
            {event.location && (
              <p className="text-xs mt-0.5 truncate" style={{ color: '#6B8F7C' }}>📍 {event.location}</p>
            )}

            {/* 반복 */}
            {event.repeat && event.repeat !== 'none' && (
              <p className="text-xs mt-0.5" style={{ color: '#5CB370' }}>🔁 {REPEAT_LABEL[event.repeat]}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {parts.map(p => <span key={p} className="text-base">{getMember(p).emoji}</span>)}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <button onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: '#5CB370' }}>
            💬 {event.comments?.length ? `댓글 ${event.comments.length}` : '댓글 남기기'}
            <span style={{ fontSize: 9 }}>{expanded ? '▲' : '▼'}</span>
          </button>
          <button onClick={onEdit}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ color: '#9CB4A8', background: '#F4FAF6', border: '1px solid #E2EEE8' }}>
            수정
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: '#E2EEE8', background: '#F9FCF9' }}>
          {event.comments?.length > 0 ? (
            event.comments.map(c => {
              const m = getMember(c.author)
              const liked  = c.reactions?.like?.includes(author.name)
              const sadded = c.reactions?.sad?.includes(author.name)
              return (
                <div key={c.id} className="flex gap-2.5 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: m.color + '33', border: `1.5px solid ${m.color}` }}>
                    {m.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold" style={{ color: m.textColor }}>{c.author}</span>
                      <span className="text-xs" style={{ color: '#9CB4A8' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: '#1A3A2A' }}>{c.text}</p>
                    <div className="flex gap-2 mt-1.5">
                      {[['like','❤️','🤍','#FF8FAB','#FFE4ED'],['sad','😢','🙁','#6BB5FF','#E3F2FD']].map(
                        ([type, activeEmoji, inactiveEmoji, color, bg]) => {
                          const isOn = type === 'like' ? liked : sadded
                          return (
                            <button key={type}
                              onClick={() => handleReaction(c.id, type)}
                              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all"
                              style={{
                                background: isOn ? bg : '#fff',
                                border: `1px solid ${isOn ? color : '#E2EEE8'}`,
                                color: isOn ? color : '#9CB4A8',
                                fontWeight: 600,
                              }}>
                              {isOn ? activeEmoji : inactiveEmoji}{' '}
                              {c.reactions?.[type]?.length || 0}
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-center py-2" style={{ color: '#9CB4A8' }}>
              첫 댓글을 남겨보세요 😊
            </p>
          )}

          {/* 작성자 선택 */}
          <div className="flex gap-1.5 pt-1">
            {MEMBERS.map(m => (
              <button key={m.name} onClick={() => setAuthor(m)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: author.name === m.name ? m.color : '#fff',
                  color: author.name === m.name ? '#fff' : '#9CB4A8',
                  border: `1.5px solid ${author.name === m.name ? m.color : '#E2EEE8'}`,
                }}>
                {m.emoji} {m.name}
              </button>
            ))}
          </div>

          {/* 입력 */}
          <div className="flex gap-2">
            <input
              className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
              style={{ border: '1.5px solid #E2EEE8', background: '#fff', color: '#1A3A2A' }}
              placeholder={`${author.name}(으)로 메시지...`}
              value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
            />
            <button onClick={submitComment} disabled={!text.trim()}
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center flex-shrink-0"
              style={{ background: text.trim() ? 'linear-gradient(135deg,#5CB370,#4A9B8C)' : '#D1D5DB' }}>
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DayDetailSheet({ selectedDate, events, onEdit, onAddEvent, onEventsUpdated, onClose }) {
  if (!selectedDate) return null
  const label = `${selectedDate.getMonth()+1}월 ${selectedDate.getDate()}일 (${WEEK[selectedDate.getDay()]})`

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(26,58,42,0.22)' }} />
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto rounded-t-3xl bg-white flex flex-col"
        style={{ maxHeight: '78vh', boxShadow: '0 -4px 32px rgba(0,0,0,0.10)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* 시트 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#E2EEE8' }}>
          <h3 className="text-base font-bold" style={{ color: '#1A3A2A' }}>{label}</h3>
          <div className="flex items-center gap-2">
            {/* 일정 추가 버튼 */}
            <button
              onClick={onAddEvent}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ background: 'linear-gradient(135deg,#5CB370,#4A9B8C)' }}
              title="이 날 일정 추가"
            >+</button>
            <button onClick={onClose} className="text-xl" style={{ color: '#9CB4A8' }}>×</button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 pt-3 pb-6">
          {events.length === 0 ? (
            <div className="flex flex-col items-center py-12" style={{ color: '#9CB4A8' }}>
              <span className="text-4xl mb-2">🌿</span>
              <p className="text-sm font-medium">여유로운 하루예요</p>
              <button
                onClick={onAddEvent}
                className="mt-4 px-4 py-2 rounded-2xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#5CB370,#4A9B8C)' }}
              >+ 일정 추가하기</button>
            </div>
          ) : (
            events.map(event => (
              <EventCard
                key={event.id} event={event}
                onEdit={() => onEdit(event)}
                onEventsUpdated={onEventsUpdated}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
