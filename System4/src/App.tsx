import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from './components/ui/card'

const navItems = [
  'Dashboard',
  'Calendar',
  'Analytics',
  'Sessions',
  'Goals',
  'Insights',
  'Settings',
]

const calendarConfig = {
  year: 2026,
  monthIndex: 4,
  monthLabel: 'May 2026',
  startedDay: 2,
  todayDay: 27,
  absents: new Set([10, 13, 20, 26]),
}

const STORAGE_KEY = 'pulse-attendance-v1'
const PAY_RATE_KEY = 'pulse-pay-rate-v1'
const CHAT_KEY = 'pulse-chat-v1'
const DEFAULT_PAY_RATE = 300

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

type CalendarDay = {
  label: string
  dayNumber: number
  status: 'prestart' | 'present' | 'absent' | 'future'
  dutyPaid: boolean
  dutyRate?: number
}

const buildCalendarDays = (): CalendarDay[] => {
  const daysInMonth = new Date(calendarConfig.year, calendarConfig.monthIndex + 1, 0).getDate()
  const days: CalendarDay[] = []

  for (let day = 1; day <= daysInMonth; day += 1) {
    if (day < calendarConfig.startedDay) {
      days.push({
        label: `${calendarConfig.monthLabel.split(' ')[0]} ${day}`,
        dayNumber: day,
        status: 'prestart',
        dutyPaid: false,
        dutyRate: undefined,
      })
      continue
    }

    if (day > calendarConfig.todayDay) {
      days.push({
        label: `${calendarConfig.monthLabel.split(' ')[0]} ${day}`,
        dayNumber: day,
        status: 'future',
        dutyPaid: false,
        dutyRate: undefined,
      })
      continue
    }

    const status = calendarConfig.absents.has(day) ? 'absent' : 'present'
    days.push({
      label: `${calendarConfig.monthLabel.split(' ')[0]} ${day}`,
      dayNumber: day,
      status,
      dutyPaid: false,
      dutyRate: undefined,
    })
  }

  return days
}

const applyAttendanceOverrides = (
  days: CalendarDay[],
  overrides: Record<number, { status: CalendarDay['status']; dutyPaid?: boolean; dutyRate?: number }>,
) =>
  days.map((day) => {
    const override = overrides[day.dayNumber]
    if (!override || day.status === 'prestart') {
      return day
    }

    return {
      ...day,
      status: override.status,
      dutyPaid: override.status === 'present' ? Boolean(override.dutyPaid) : false,
      dutyRate: override.status === 'present' ? override.dutyRate : undefined,
    }
  })

const loadAttendanceOverrides = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as Record<string, { status: CalendarDay['status']; dutyPaid?: boolean; dutyRate?: number }>
    return Object.keys(parsed).reduce<Record<number, { status: CalendarDay['status']; dutyPaid?: boolean; dutyRate?: number }>>((acc, key) => {
      const dayNumber = Number(key)
      const entry = parsed[key]
      if (
        !Number.isNaN(dayNumber)
        && entry
        && (entry.status === 'present' || entry.status === 'absent')
      ) {
        acc[dayNumber] = entry
      }
      return acc
    }, {})
  } catch {
    return {}
  }
}

const persistAttendanceOverrides = (days: CalendarDay[]) => {
  const payload = days.reduce<Record<number, { status: CalendarDay['status']; dutyPaid?: boolean; dutyRate?: number }>>((acc, day) => {
    if (day.status === 'present' || day.status === 'absent') {
      acc[day.dayNumber] = {
        status: day.status,
        dutyPaid: day.status === 'present' ? day.dutyPaid : undefined,
        dutyRate: day.status === 'present' ? day.dutyRate : undefined,
      }
    }
    return acc
  }, {})

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const loadPayRate = () => {
  try {
    const raw = localStorage.getItem(PAY_RATE_KEY)
    const parsed = raw ? Number(raw) : DEFAULT_PAY_RATE
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAY_RATE
  } catch {
    return DEFAULT_PAY_RATE
  }
}

const loadChat = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const buildCalendarWeeks = (days: CalendarDay[]) => {
  const firstWeekday = new Date(calendarConfig.year, calendarConfig.monthIndex, 1).getDay()
  const mondayIndex = (firstWeekday + 6) % 7
  const padded: Array<CalendarDay | null> = Array.from({ length: mondayIndex }, () => null)

  days.forEach((day) => padded.push(day))

  const weeks: Array<Array<CalendarDay | null>> = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  return weeks
}

const countByStatus = (days: CalendarDay[]) =>
  days.reduce(
    (acc, day) => {
      acc[day.status] += 1
      return acc
    },
    { prestart: 0, present: 0, absent: 0, future: 0 },
  )

const buildWeeklyAttendance = (weeks: Array<Array<CalendarDay | null>>) =>
  weeks.map((week, index) => {
    const present = week.filter((day) => day?.status === 'present').length
    const absent = week.filter((day) => day?.status === 'absent').length

    return {
      label: `W${index + 1}`,
      present,
      absent,
      consistency: present === 0 ? 0 : Math.round((present / (present + absent)) * 100),
    }
  })

const getCurrentStreak = (days: CalendarDay[]) => {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i]
    if (day.status === 'future' || day.status === 'prestart') {
      continue
    }
    if (day.status === 'present') {
      streak += 1
    } else if (day.status === 'absent') {
      break
    }
  }
  return streak
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function App() {
  const [activeNav, setActiveNav] = useState(navItems[0])
  const [payRate, setPayRate] = useState(loadPayRate)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const stored = loadChat()
    if (stored.length > 0) {
      return stored
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Ask me about your attendance, streaks, or how to optimize your work rhythm.',
        timestamp: 'Now',
      },
    ]
  })
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => {
    const defaults = buildCalendarDays()
    return applyAttendanceOverrides(defaults, loadAttendanceOverrides())
  })
  const calendarWeeks = useMemo(() => buildCalendarWeeks(calendarDays), [calendarDays])
  const counts = useMemo(() => countByStatus(calendarDays), [calendarDays])
  const weeklyAttendance = useMemo(
    () => buildWeeklyAttendance(calendarWeeks),
    [calendarWeeks],
  )

  const [selectedDayNumber, setSelectedDayNumber] = useState(calendarConfig.todayDay)
  const selectedDay = calendarDays.find((day) => day.dayNumber === selectedDayNumber) ?? calendarDays[0]

  const attendanceRate = counts.present + counts.absent === 0
    ? 0
    : Math.round((counts.present / (counts.present + counts.absent)) * 100)

  const trackedDays = counts.present + counts.absent
  const paidDays = useMemo(
    () => calendarDays.filter((day) => day.status === 'present' && day.dutyPaid).length,
    [calendarDays],
  )
  const totalEarnings = useMemo(
    () => calendarDays.reduce((sum, day) => {
      if (day.status === 'present' && day.dutyPaid) {
        return sum + (day.dutyRate ?? payRate)
      }
      return sum
    }, 0),
    [calendarDays, payRate],
  )

  const updateDayStatus = (dayNumber: number, status: CalendarDay['status']) => {
    if (dayNumber < calendarConfig.startedDay) {
      return
    }
    setCalendarDays((prev) =>
      {
        const next = prev.map((day) =>
          day.dayNumber === dayNumber
            ? {
              ...day,
              status,
              dutyPaid: status === 'present' ? day.dutyPaid : false,
              dutyRate: status === 'present' ? day.dutyRate : undefined,
            }
            : day,
        )
        persistAttendanceOverrides(next)
        return next
      },
    )
  }

  const updateDutyPaid = (dayNumber: number, dutyPaid: boolean) => {
    setCalendarDays((prev) =>
      {
        const next = prev.map((day) =>
          day.dayNumber === dayNumber
            ? {
              ...day,
              dutyPaid,
              dutyRate: dutyPaid ? (day.dutyRate ?? payRate) : undefined,
            }
            : day,
        )
        persistAttendanceOverrides(next)
        return next
      },
    )
  }

  const stats = [
    { label: 'Days worked', value: `${counts.present}`, change: `${attendanceRate}% rate` },
    { label: 'Consistency', value: `${attendanceRate}%`, change: 'Started May 2' },
    { label: 'Absences', value: `${counts.absent}`, change: '4 total' },
    { label: 'Current streak', value: `${getCurrentStreak(calendarDays)} days`, change: 'Active' },
    { label: 'Month progress', value: `${trackedDays} days`, change: calendarConfig.monthLabel },
    { label: 'Duty paid days', value: `${paidDays}`, change: `PHP ${payRate}/day` },
    { label: 'Earnings', value: `PHP ${totalEarnings}`, change: 'Duty paid only' },
  ]

  useEffect(() => {
    localStorage.setItem(PAY_RATE_KEY, String(payRate))
  }, [payRate])

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatMessages))
  }, [chatMessages])

  const handleSendMessage = () => {
    const trimmed = chatInput.trim()
    if (!trimmed) {
      return
    }

    const now = new Date()
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: ChatMessage = {
      id: `${now.getTime()}-user`,
      role: 'user',
      content: trimmed,
      timestamp: timeLabel,
    }
    const assistantMessage: ChatMessage = {
      id: `${now.getTime()}-assistant`,
      role: 'assistant',
      content: 'This is a demo assistant. Hook me to your AI provider to answer deeper insights.',
      timestamp: timeLabel,
    }

    setChatMessages((prev) => [...prev, userMessage, assistantMessage])
    setChatInput('')
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-200">
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-80 animate-shimmer" />

      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col gap-8 border-r border-white/10 bg-charcoal-900/70 px-6 py-10 lg:flex">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Pulse</p>
              <h1 className="text-2xl font-semibold text-white">Command</h1>
            </div>
            <span className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center glow-ring">P</span>
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(item)}
                aria-current={activeNav === item ? 'page' : undefined}
                className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${
                  activeNav === item
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item}</span>
                {activeNav === item ? (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Live</span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <Card className="p-4">
              <CardDescription>Calendar range</CardDescription>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-2xl font-semibold text-white">May 2 start</p>
                <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">Active</Badge>
              </div>
            </Card>
            <Button className="w-full">Log session</Button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveNav(item)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition ${
                    activeNav === item
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-white/60'
                  }`}
                >
                  {item}
                </button>
              ))}
            </motion.div>
            <motion.header variants={itemVariants} className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Personal work intelligence</p>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">Pulse {activeNav}</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="border-pulseblue-500/40 bg-pulseblue-500/10 text-pulseblue-200">{calendarConfig.monthLabel}</Badge>
                <Button>Export report</Button>
              </div>
            </motion.header>

            {(activeNav === 'Dashboard' || activeNav === 'Calendar') && (
              <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Activity calendar</CardTitle>
                      <CardDescription>Numbered days. Click a day for status.</CardDescription>
                    </div>
                    <Badge className="border-white/10 bg-white/5 text-white/60">Absences: 10, 13, 20, 26</Badge>
                  </CardHeader>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-7 text-xs text-white/50">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <span key={day} className="text-center">
                          {day}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-white/60">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />Present
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-pulseblue-400" />Duty paid
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-redglow-400" />Absent
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white/30" />Future
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white/10" />Prestart
                      </span>
                    </div>
                    <div className="space-y-2">
                      {calendarWeeks.map((week, weekIndex) => (
                        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-2">
                          {week.map((day, dayIndex) => {
                            if (!day) {
                              return <div key={`empty-${weekIndex}-${dayIndex}`} className="h-9 sm:h-10" />
                            }

                            const baseClass =
                              day.status === 'present' && day.dutyPaid
                                ? 'bg-pulseblue-500/30 border-pulseblue-500/40 text-pulseblue-200'
                                : day.status === 'present'
                                  ? 'bg-emerald-500/30 border-emerald-500/40 text-emerald-100'
                                : day.status === 'absent'
                                  ? 'bg-redglow-500/20 border-redglow-500/30 text-redglow-200'
                                  : day.status === 'future'
                                    ? 'bg-white/5 border-white/10 text-white/40'
                                    : 'bg-white/5 border-white/5 text-white/30'

                            const isSelectable = day.status !== 'prestart'

                            return (
                              <button
                                key={day.label}
                                type="button"
                                onClick={() => setSelectedDayNumber(day.dayNumber)}
                                className={`flex h-9 items-center justify-center rounded-lg border text-xs font-medium transition sm:h-10 sm:text-sm ${
                                  isSelectable ? 'hover:scale-105' : 'cursor-default'
                                } ${
                                  baseClass
                                } ${
                                  selectedDay.label === day.label
                                    ? 'ring-2 ring-emerald-300/60'
                                    : 'ring-0'
                                }`}
                              >
                                {day.dayNumber}
                              </button>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <CardHeader>
                    <div>
                      <CardTitle>{selectedDay.label}</CardTitle>
                      <CardDescription>Attendance status</CardDescription>
                    </div>
                    <Badge
                      className={`border-white/10 bg-white/5 text-white/70 ${
                        selectedDay.status === 'present' && selectedDay.dutyPaid
                          ? 'border-pulseblue-500/40 bg-pulseblue-500/10 text-pulseblue-200'
                          : selectedDay.status === 'present'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : selectedDay.status === 'absent'
                            ? 'border-redglow-500/40 bg-redglow-500/10 text-redglow-200'
                            : selectedDay.status === 'future'
                              ? 'border-white/10 bg-white/5 text-white/50'
                            : ''
                      }`}
                    >
                      {selectedDay.status === 'present'
                        ? selectedDay.dutyPaid
                          ? 'duty paid'
                          : 'duty not paid'
                        : selectedDay.status}
                    </Badge>
                  </CardHeader>
                  <div className="mt-4 space-y-4 text-sm text-white/70">
                    <div className="flex items-center justify-between">
                      <span>Started tracking</span>
                      <span className="text-white">May 2, 2026</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Calendar absences</span>
                      <span className="text-white">{counts.absent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Attendance rate</span>
                      <span className="text-white">{attendanceRate}%</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                      {selectedDay.status === 'absent'
                        ? 'Marked as an absence. No session data recorded.'
                        : selectedDay.status === 'future'
                          ? 'Future day. Mark present once the day is complete.'
                          : selectedDay.status === 'prestart'
                            ? 'Tracking had not started yet.'
                            : selectedDay.dutyPaid
                              ? `Present day. Duty paid recorded at PHP ${selectedDay.dutyRate ?? payRate}.`
                              : 'Present day. Duty not paid yet.'}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        className="w-full"
                        disabled={selectedDay.status === 'prestart'}
                        onClick={() => updateDayStatus(selectedDay.dayNumber, 'present')}
                      >
                        Mark present
                      </Button>
                      <Button
                        className="w-full border border-pulseblue-500/40 bg-pulseblue-500/10 text-pulseblue-100 hover:bg-pulseblue-500/20"
                        disabled={selectedDay.status !== 'present'}
                        onClick={() => updateDutyPaid(selectedDay.dayNumber, true)}
                      >
                        Mark duty paid
                      </Button>
                      <Button
                        className="w-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                        disabled={selectedDay.status !== 'present'}
                        onClick={() => updateDutyPaid(selectedDay.dayNumber, false)}
                      >
                        Mark duty not paid
                      </Button>
                      <Button
                        className="w-full border border-redglow-500/40 bg-redglow-500/10 text-redglow-100 hover:bg-redglow-500/20"
                        disabled={selectedDay.status === 'prestart'}
                        onClick={() => updateDayStatus(selectedDay.dayNumber, 'absent')}
                      >
                        Mark absent
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.section>
            )}

            {activeNav === 'Dashboard' && (
              <motion.section variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
                {stats.map((stat) => (
                  <Card key={stat.label} className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <p className="text-sm text-white/60">{stat.label}</p>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-3xl font-semibold text-white">{stat.value}</p>
                      <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">{stat.change}</Badge>
                    </div>
                  </Card>
                ))}
              </motion.section>
            )}

            {(activeNav === 'Dashboard' || activeNav === 'Analytics') && (
              <>
                <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Pay calculator</CardTitle>
                        <CardDescription>Daily rate and duty-paid totals</CardDescription>
                      </div>
                    </CardHeader>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <label className="text-xs uppercase tracking-[0.3em] text-white/40">Daily rate (PHP)</label>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            value={payRate}
                            onChange={(event) => setPayRate(Number(event.target.value))}
                            className="w-40 rounded-xl border border-white/10 bg-charcoal-900/70 px-4 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
                          />
                          <Badge className="border-white/10 bg-white/5 text-white/60">Default: PHP 300/day</Badge>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Duty paid days</p>
                          <p className="mt-3 text-3xl font-semibold text-white">{paidDays}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total earned</p>
                          <p className="mt-3 text-3xl font-semibold text-white">PHP {totalEarnings}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>AI assistant</CardTitle>
                        <CardDescription>Personal analytics chatbot (demo)</CardDescription>
                      </div>
                      <Badge className="border-white/10 bg-white/5 text-white/60">UI only</Badge>
                    </CardHeader>
                    <div className="mt-4 flex h-72 flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex-1 space-y-3 overflow-y-auto pr-2 text-sm">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                              message.role === 'user'
                                ? 'ml-auto bg-emerald-500/20 text-emerald-100'
                                : 'bg-white/10 text-white/80'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                              {message.timestamp}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              handleSendMessage()
                            }
                          }}
                          placeholder="Ask about earnings or attendance..."
                          className="flex-1 rounded-xl border border-white/10 bg-charcoal-900/70 px-4 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
                        />
                        <Button onClick={handleSendMessage}>Send</Button>
                      </div>
                    </div>
                  </Card>
                </motion.section>
                <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Weekly days worked</CardTitle>
                        <CardDescription>Attendance momentum</CardDescription>
                      </div>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyAttendance}>
                          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(148, 163, 184, 0.2)',
                              borderRadius: 12,
                            }}
                          />
                          <Bar dataKey="present" fill="#41f2b2" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Absences by week</CardTitle>
                        <CardDescription>Time off distribution</CardDescription>
                      </div>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyAttendance}>
                          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(148, 163, 184, 0.2)',
                              borderRadius: 12,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="absent"
                            stroke="#ff7a85"
                            strokeWidth={2.5}
                            dot={{ r: 4, strokeWidth: 2, fill: '#ff7a85' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.section>

                <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Consistency score</CardTitle>
                        <CardDescription>Attendance reliability</CardDescription>
                      </div>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyAttendance}>
                          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(148, 163, 184, 0.2)',
                              borderRadius: 12,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="consistency"
                            stroke="#63a3ff"
                            fill="rgba(99, 163, 255, 0.2)"
                            strokeWidth={2.5}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Attendance rhythm</CardTitle>
                        <CardDescription>Streaks and breaks</CardDescription>
                      </div>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyAttendance}>
                          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(148, 163, 184, 0.2)',
                              borderRadius: 12,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="present"
                            stroke="#f6c453"
                            strokeWidth={2.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.section>
              </>
            )}

            {(activeNav === 'Dashboard' || activeNav === 'Sessions') && (
              <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Session timeline</CardTitle>
                      <CardDescription>Log sessions to unlock this view</CardDescription>
                    </div>
                  </CardHeader>
                  <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
                    No session data yet. Add your first session to populate the timeline.
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Mood tracking</CardTitle>
                      <CardDescription>Capture energy signals per session</CardDescription>
                    </div>
                  </CardHeader>
                  <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
                    Mood insights will appear after you log sessions.
                  </div>
                </Card>
              </motion.section>
            )}

            {['Goals', 'Insights', 'Settings'].includes(activeNav) && (
              <motion.section variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>{activeNav}</CardTitle>
                      <CardDescription>Configure this space when you are ready.</CardDescription>
                    </div>
                  </CardHeader>
                  <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
                    This section is ready for data and automation.
                  </div>
                </Card>
              </motion.section>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
