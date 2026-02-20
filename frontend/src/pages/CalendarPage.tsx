import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { ShiftChip } from '../components/calendar/ShiftChip'
import { AddShiftModal } from '../components/calendar/AddShiftModal'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { listShifts } from '../api/shifts'
import { listTemplates } from '../api/shiftTemplates'
import { Shift, ShiftTemplate } from '../types'
import { getDaysInMonthGrid, MONTH_NAMES, formatDate } from '../utils/dateUtils'
import { formatCurrency, formatHours } from '../utils/formatUtils'

const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

export const CalendarPage: React.FC = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayShifts, setDayShifts] = useState<Shift[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editShift, setEditShift] = useState<Shift | undefined>()
  const [dayModalOpen, setDayModalOpen] = useState(false)

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([listShifts(year, month), listTemplates()])
    setShifts(s)
    setTemplates(t)
  }, [year, month])

  useEffect(() => { load() }, [load])

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const { totalDays, startOffset } = getDaysInMonthGrid(year, month)

  const shiftsForDay = (day: number) =>
    shifts.filter((s) => s.date === `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setDayShifts(shiftsForDay(day))
    setDayModalOpen(true)
  }

  const handleAdd = (date?: string) => {
    setEditShift(undefined)
    if (date) setSelectedDate(date)
    setDayModalOpen(false)
    setAddOpen(true)
  }

  const templateMap = Object.fromEntries(templates.map(t => [t.id, t]))

  const totalHours = shifts.reduce((s, sh) => s + sh.total_hours, 0)
  const totalGross = shifts.reduce((s, sh) => s + sh.gross_pay, 0)

  return (
    <Layout
      title={`${MONTH_NAMES[month - 1]} ${year}`}
      headerRight={
        <Button size="sm" onClick={() => handleAdd(formatDate(today))}>
          <Plus size={16} className="inline -mt-0.5" /> Ny vakt
        </Button>
      }
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500">{totalDays} dager</p>
        </div>
        <button onClick={next} className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month summary */}
      {shifts.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Vakter', value: shifts.length },
            { label: 'Timer', value: formatHours(totalHours) },
            { label: 'Brutto', value: formatCurrency(totalGross) },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="card p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayShiftsArr = shiftsForDay(day)
            const isToday =
              day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
            const dow = (startOffset + i) % 7  // 0=Mon..6=Sun
            const isWeekend = dow >= 5

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  min-h-[52px] rounded-xl p-1 cursor-pointer transition-colors border
                  ${isToday ? 'bg-primary-50 border-primary-300' : isWeekend ? 'bg-gray-50 border-transparent' : 'bg-white border-transparent hover:bg-gray-50'}
                `}
              >
                <span
                  className={`text-xs font-semibold block text-center mb-0.5 ${
                    isToday ? 'text-primary-700' : isWeekend ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayShiftsArr.slice(0, 2).map((s) => (
                    <ShiftChip
                      key={s.id}
                      shift={s}
                      template={s.template_id ? templateMap[s.template_id] : undefined}
                    />
                  ))}
                  {dayShiftsArr.length > 2 && (
                    <span className="text-[10px] text-gray-400">+{dayShiftsArr.length - 2}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail modal */}
      <Modal open={dayModalOpen} onClose={() => setDayModalOpen(false)} title={selectedDate || ''}>
        <div className="space-y-3">
          {dayShifts.length === 0 && (
            <p className="text-gray-400 text-center py-4">Ingen vakter registrert</p>
          )}
          {dayShifts.map((s) => {
            const tpl = s.template_id ? templateMap[s.template_id] : undefined
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => { setEditShift(s); setDayModalOpen(false); setAddOpen(true) }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tpl?.color || '#4F46E5' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {tpl ? `[${tpl.code}] ${tpl.name}` : 'Manuell vakt'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.start_time}–{s.end_time} · {formatHours(s.total_hours)} · {formatCurrency(s.gross_pay)}
                  </p>
                  {s.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{s.note}</p>}
                </div>
                <span className="text-gray-300 text-xs">›</span>
              </div>
            )
          })}
          <Button
            fullWidth
            onClick={() => handleAdd(selectedDate || undefined)}
          >
            <Plus size={16} className="inline -mt-0.5 mr-1" /> Legg til vakt
          </Button>
        </div>
      </Modal>

      {/* Add/edit shift modal */}
      <AddShiftModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={load}
        date={selectedDate || formatDate(today)}
        templates={templates}
        editShift={editShift}
      />
    </Layout>
  )
}
