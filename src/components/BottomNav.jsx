const TABS = [
  { id: 'calendar', label: '캘린더', icon: '📅' },
  { id: 'todo', label: '할일', icon: '✅' },
  { id: 'timetable', label: '시간표', icon: '📚' },
  { id: 'games', label: '게임', icon: '🎮' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="flex w-full max-w-[480px] mx-auto px-2 pb-safe"
      style={{ background: '#fff', boxShadow: '0 -1px 0 #E2EEE8, 0 -4px 20px rgba(0,0,0,0.04)' }}
    >
      {TABS.map(tab => {
        const on = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all"
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-semibold" style={{ color: on ? '#5CB370' : '#9CB4A8' }}>
              {tab.label}
            </span>
            {on && (
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: '#5CB370' }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
