export const MEMBERS = [
  { name: '엄마', color: '#FF8FAB', textColor: '#C2185B', emoji: '👩', bg: '#FFF0F3' },
  { name: '아빠', color: '#6BB5FF', textColor: '#1565C0', emoji: '👨', bg: '#EFF6FF' },
  { name: '아들', color: '#5CB370', textColor: '#2E7D32', emoji: '👦', bg: '#E8F5E9' },
]

// 표시용 (필터·참여자 모두 3명)
export const EVENT_MEMBERS = MEMBERS

export function getMember(name) {
  return MEMBERS.find(m => m.name === name) ?? MEMBERS[0]
}
