import { useState } from 'react'
import BottomNav from './components/BottomNav'
import CalendarPage from './pages/CalendarPage'
import TodoPage from './pages/TodoPage'
import TimetablePage from './pages/TimetablePage'
import GamesPage from './pages/GamesPage'

const PAGES = { calendar: CalendarPage, todo: TodoPage, timetable: TimetablePage, games: GamesPage }

export default function App() {
  const [activePage, setActivePage] = useState('calendar')
  const Page = PAGES[activePage]

  return (
    <div className="h-dvh flex flex-col" style={{ background: '#F4FAF6' }}>
      <div className="flex-1 overflow-y-auto">
        <Page />
      </div>
      <BottomNav active={activePage} onChange={setActivePage} />
    </div>
  )
}
