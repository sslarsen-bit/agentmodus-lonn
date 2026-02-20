import { format, parse, getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import { nb } from 'date-fns/locale'

export const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')
export const formatDisplay = (dateStr: string) =>
  format(parse(dateStr, 'yyyy-MM-dd', new Date()), 'd. MMM yyyy', { locale: nb })
export const formatMonthYear = (year: number, month: number) =>
  format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: nb })

export const getDaysInMonthGrid = (year: number, month: number) => {
  const firstDay = startOfMonth(new Date(year, month - 1, 1))
  const totalDays = getDaysInMonth(new Date(year, month - 1, 1))
  // Monday-first: 0=Mon..6=Sun
  let startOffset = getDay(firstDay) - 1
  if (startOffset < 0) startOffset = 6
  return { totalDays, startOffset }
}

export const formatTime = (timeStr: string) => timeStr.slice(0, 5)

export const secondsToHMS = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const MONTH_NAMES = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
]
