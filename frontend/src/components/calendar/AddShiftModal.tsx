import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { ShiftTemplate, Shift } from '../../types'
import { createShift, updateShift, deleteShift } from '../../api/shifts'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  date: string
  templates: ShiftTemplate[]
  editShift?: Shift
}

export const AddShiftModal: React.FC<Props> = ({ open, onClose, onSaved, date, templates, editShift }) => {
  const [mode, setMode] = useState<'template' | 'manual'>('manual')
  const [templateId, setTemplateId] = useState<number | ''>('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('16:00')
  const [pauseMin, setPauseMin] = useState(30)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editShift) {
      setStartTime(editShift.start_time)
      setEndTime(editShift.end_time)
      setPauseMin(editShift.pause_min)
      setNote(editShift.note || '')
      setTemplateId(editShift.template_id || '')
      setMode(editShift.template_id ? 'template' : 'manual')
    } else {
      setStartTime('08:00')
      setEndTime('16:00')
      setPauseMin(30)
      setNote('')
      setTemplateId('')
      setMode('manual')
    }
  }, [editShift, open])

  const handleTemplateChange = (id: number | '') => {
    setTemplateId(id)
    if (id) {
      const tpl = templates.find((t) => t.id === Number(id))
      if (tpl) {
        setStartTime(tpl.start_time)
        setEndTime(tpl.end_time)
        setPauseMin(tpl.pause_min)
      }
    }
  }

  const handleSave = async () => {
    setError('')
    setLoading(true)
    try {
      const payload = {
        date,
        start_time: startTime,
        end_time: endTime,
        pause_min: pauseMin,
        template_id: templateId ? Number(templateId) : undefined,
        note: note || undefined,
      }
      if (editShift) {
        await updateShift(editShift.id, payload)
      } else {
        await createShift(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editShift) return
    if (!confirm('Slett denne vakten?')) return
    setLoading(true)
    try {
      await deleteShift(editShift.id)
      onSaved()
      onClose()
    } catch {
      setError('Klarte ikke slette')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editShift ? 'Rediger vakt' : 'Legg til vakt'}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500 font-medium">{date}</p>

        {/* Mode tabs */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          {(['manual', 'template'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mode === m ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m === 'manual' ? 'Manuelt' : 'Fra vaktkode'}
            </button>
          ))}
        </div>

        {mode === 'template' && (
          <Select
            label="Vaktkode"
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Velg vaktkode...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.code}] {t.name} ({t.start_time}–{t.end_time})
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Slutt"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <Input
          label="Pause (minutter)"
          type="number"
          value={pauseMin}
          onChange={(e) => setPauseMin(Number(e.target.value))}
          min={0}
        />
        <Input
          label="Notat (valgfritt)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Legg til notat..."
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {editShift && (
            <Button variant="danger" onClick={handleDelete} loading={loading} className="flex-shrink-0">
              Slett
            </Button>
          )}
          <Button fullWidth onClick={handleSave} loading={loading}>
            {editShift ? 'Lagre endringer' : 'Legg til vakt'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
