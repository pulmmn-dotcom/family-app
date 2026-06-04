export default function TodoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-32" style={{ color: '#c8c0b8' }}>
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4"
        style={{ background: '#f0ebe3', boxShadow: '6px 6px 14px #d4ccc4, -6px -6px 14px #ffffff' }}
      >
        ✅
      </div>
      <p className="text-base font-bold mt-2" style={{ color: '#8a7a72' }}>할일 목록</p>
      <p className="text-sm mt-1">곧 추가될 예정이에요</p>
    </div>
  )
}
