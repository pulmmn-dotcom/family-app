import { useState } from 'react'
import { PRESETS, loadWorkPattern, saveWorkPattern, clearWorkPattern } from '../../utils/workPattern'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const STATUS_COLOR = { 주간: '#FFF3E0', 야간: '#EDE7F6', 휴무: '#E8F5E9', 비번: '#E8F5E9' }

export default function WorkPatternModal({ onClose, onSaved }) {
  const existing = loadWorkPattern()
  const [startDate, setStartDate] = useState(existing?.startDate || todayStr())
  const [preset, setPreset] = useState(
    existing
      ? PRESETS.findIndex(p => p.pattern.join(',') === existing.pattern.join(','))
      : 0
  )

  function handleSave() {
    saveWorkPattern({ startDate, pattern: PRESETS[preset].pattern })
    onSaved()
    onClose()
  }

  function handleClear() {
    clearWorkPattern()
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/25 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-3xl bg-white px-5 pb-10 pt-4"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.10)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#1A3A2A' }}>👨 아빠 근무 패턴</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9CB4A8' }}>한 번 등록하면 자동으로 반복돼요</p>
          </div>
          <button onClick={onClose} className="text-2xl" style={{ color: '#9CB4A8' }}>×</button>
        </div>

        {/* 시작일 */}
        <div className="mb-4">
          <label className="block text-xs font-bold mb-1.5" style={{ color: '#6B8F7C' }}>
            📅 패턴 시작일 (주간 1일차)
          </label>
          <input
            type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full text-sm px-4 py-2.5 rounded-xl outline-none"
            style={{ border: '1.5px solid #E2EEE8', background: '#fff', color: '#1A3A2A' }}
          />
        </div>

        {/* 패턴 선택 */}
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-bold mb-2" style={{ color: '#6B8F7C' }}>🔄 패턴</label>
          {PRESETS.map((p, i) => (
            <button
              key={i} onClick={() => setPreset(i)}
              className="w-full text-left px-4 py-3 rounded-2xl border-2 transition-all"
              style={{
                borderColor: preset === i ? '#5CB370' : '#E2EEE8',
                background: preset === i ? '#F4FAF6' : '#fff',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold" style={{ color: '#1A3A2A' }}>{p.label}</span>
                {preset === i && <span style={{ color: '#5CB370' }}>✓</span>}
              </div>
              <div className="flex gap-1.5">
                {p.pattern.map((s, j) => (
                  <span key={j} className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: STATUS_COLOR[s] || '#E8F5E9', color: '#1A3A2A' }}>
                    {s}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2.5">
          {existing && (
            <button onClick={handleClear} className="px-4 py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#FFF0F3', color: '#E91E63', border: '1.5px solid #FFD6E3' }}>
              초기화
            </button>
          )}
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#5CB370,#4A9B8C)' }}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
