import { MEMBERS } from '../../constants/members'

export default function MemberFilterChips({ active, onChange }) {
  function toggle(name) {
    const next = new Set(active)
    next.has(name) ? next.delete(name) : next.add(name)
    onChange(next)
  }

  return (
    <div className="flex gap-2 px-4 py-3" style={{ scrollbarWidth: 'none' }}>
      {MEMBERS.map(m => {
        const on = active.has(m.name)
        return (
          <button
            key={m.name}
            onClick={() => toggle(m.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex-shrink-0"
            style={{
              background: on ? m.color : '#fff',
              color: on ? '#fff' : '#9CB4A8',
              border: `1.5px solid ${on ? m.color : '#E2EEE8'}`,
              boxShadow: on ? `0 2px 8px ${m.color}55` : 'none',
            }}
          >
            <span className="text-base">{m.emoji}</span>
            <span>{m.name}</span>
          </button>
        )
      })}
    </div>
  )
}
