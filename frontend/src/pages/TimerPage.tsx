import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { useTimerStore } from '../store/timerStore'
import { listTemplates } from '../api/shiftTemplates'
import { createShift } from '../api/shifts'
import { ShiftTemplate } from '../types'
import { secondsToHMS, formatDate } from '../utils/dateUtils'

export const TimerPage: React.FC = () => {
  const { isRunning, elapsed, startTime, start, stop, reset, tick } = useTimerStore()
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [saveOpen, setSaveOpen] = useState(false)
  const [templateId, setTemplateId] = useState<number | ''>('')
  const [pauseMin, setPauseMin] = useState(30)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    listTemplates().then(setTemplates)
  }, [])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, tick])

  const handleStop = () => {
    stop()
    setSaveOpen(true)
  }

  const getStartEndStrings = () => {
    if (!startTime) return { date: formatDate(new Date()), startStr: '00:00', endStr: '00:00' }
    const end = new Date(startTime.getTime() + elapsed * 1000)
    const pad = (n: number) => String(n).padStart(2, '0')
    const startStr = `${pad(startTime.getHours())}:${pad(startTime.getMinutes())}`
    const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`
    const date = formatDate(startTime)
    return { date, startStr, endStr }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { date, startStr, endStr } = getStartEndStrings()
    try {
      await createShift({
        date,
        start_time: startStr,
        end_time: endStr,
        pause_min: pauseMin,
        template_id: templateId ? Number(templateId) : undefined,
        note: note || undefined,
      })
      setSaveOpen(false)
      reset()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Feil ved lagring')
    } finally {
      setSaving(false)
    }
  }

  const { date, startStr, endStr } = getStartEndStrings()

  return (
    <Layout title="Timer">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        {/* Clock display */}
        <div className="text-center">
          <div className="text-7xl font-bold tabular-nums text-gray-900 tracking-tight">
            {secondsToHMS(elapsed)}
          </div>
          {isRunning && startTime && (
            <p className="text-gray-400 mt-3 text-sm">
              Startet {String(startTime.getHours()).padStart(2, '0')}:{String(startTime.getMinutes()).padStart(2, '0')}
            </p>
          )}
          {!isRunning && elapsed === 0 && (
            <p className="text-gray-400 mt-3">Trykk Start for å begynne vakten</p>
          )}
        </div>

        {/* Start / Stop button */}
        <button
          onClick={isRunning ? handleStop : start}
          className={`
            w-36 h-36 rounded-full font-bold text-xl text-white shadow-2xl
            transition-all active:scale-95
            ${isRunning
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
              : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
            }
          `}
        >
          {isRunning ? 'Stopp' : 'Start'}
        </button>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-green-700 font-medium">
            Vakt lagret!
          </div>
        )}

        {!isRunning && elapsed > 0 && !saveOpen && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={reset}>Forkast</Button>
            <Button onClick={() => setSaveOpen(true)}>Lagre vakt</Button>
          </div>
        )}
      </div>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title="Lagre vakt">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Dato</span><span className="font-medium">{date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="font-medium">{startStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Slutt</span><span className="font-medium">{endStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Varighet</span><span className="font-medium">{secondsToHMS(elapsed)}</span></div>
          </div>

          <Select
            label="Vaktkode (valgfritt)"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Ingen vaktkode</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>[{t.code}] {t.name}</option>
            ))}
          </Select>

          <Input
            label="Pause (minutter)"
            type="number"
            value={pauseMin}
            onChange={(e) => setPauseMin(Number(e.target.value))}
            min={0}
          />
          <Input
            label="Notat"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Valgfritt notat..."
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>
          )}

          <Button fullWidth onClick={handleSave} loading={saving}>
            Lagre vakt
          </Button>
        </div>
      </Modal>
    </Layout>
  )
}
