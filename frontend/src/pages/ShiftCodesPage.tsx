import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/shiftTemplates'
import { ShiftTemplate } from '../types'

const COLORS = [
  '#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669',
  '#D97706', '#DC2626', '#DB2777', '#64748B',
]

const defaultForm = {
  code: '', name: '', start_time: '08:00', end_time: '16:00',
  pause_min: 30, color: '#4F46E5', auto_allowances: true,
}

export const ShiftCodesPage: React.FC = () => {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => listTemplates().then(setTemplates)
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(defaultForm); setEditId(null); setOpen(true) }
  const openEdit = (t: ShiftTemplate) => {
    setForm({
      code: t.code, name: t.name, start_time: t.start_time, end_time: t.end_time,
      pause_min: t.pause_min, color: t.color, auto_allowances: t.auto_allowances,
    })
    setEditId(t.id)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.name) { setError('Kode og navn er påkrevd'); return }
    setLoading(true); setError('')
    try {
      if (editId) {
        await updateTemplate(editId, form)
      } else {
        await createTemplate(form)
      }
      await load()
      setOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Feil')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Slett vaktkoden?')) return
    await deleteTemplate(id)
    load()
  }

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <Layout
      title="Vaktkoder"
      headerRight={
        <Button size="sm" onClick={openAdd}>
          <Plus size={16} className="inline -mt-0.5" /> Ny
        </Button>
      }
    >
      {templates.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium">Ingen vaktkoder ennå</p>
          <p className="text-sm mt-1">Opprett din første vaktkode</p>
        </div>
      )}

      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.id} className="card flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: t.color }}
            >
              {t.code}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-500">
                {t.start_time}–{t.end_time} · {t.pause_min} min pause
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => openEdit(t)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Rediger vaktkode' : 'Ny vaktkode'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kode (f.eks. D)"
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase().slice(0, 5))}
              placeholder="D"
            />
            <Input
              label="Navn"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Dagvakt"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start" type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
            <Input label="Slutt" type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} />
          </div>
          <Input
            label="Pause (min)"
            type="number"
            value={form.pause_min}
            onChange={(e) => set('pause_min', Number(e.target.value))}
            min={0}
          />

          {/* Color picker */}
          <div>
            <label className="label">Farge</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.auto_allowances}
              onChange={(e) => set('auto_allowances', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Automatisk beregning av tillegg</span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>
          )}

          <Button fullWidth onClick={handleSave} loading={loading}>
            {editId ? 'Lagre' : 'Opprett vaktkode'}
          </Button>
        </div>
      </Modal>
    </Layout>
  )
}
