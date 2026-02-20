import React, { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import api from '../api/client'

interface PreviewShift {
  date: string
  start_time: string
  end_time: string
  pause_min: number
  note?: string
}

export const ImportPage: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [nameFilter, setNameFilter] = useState('')
  const [preview, setPreview] = useState<PreviewShift[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [imported, setImported] = useState<number | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(null)
    setErrors([])
    setImported(null)
    setStep(1)
  }

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    if (nameFilter) form.append('name_filter', nameFilter)
    try {
      const res = await api.post('/import/preview', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreview(res.data.shifts)
      setErrors(res.data.errors)
      setStep(2)
    } catch (err: any) {
      setErrors([err.response?.data?.detail || 'Feil ved forhåndsvisning'])
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    if (nameFilter) form.append('name_filter', nameFilter)
    try {
      const res = await api.post('/import/confirm', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImported(res.data.imported)
      setStep(3)
    } catch (err: any) {
      setErrors([err.response?.data?.detail || 'Feil ved import'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Importer vakter">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Last opp fil</h3>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
            >
              <Upload size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="font-medium text-gray-600">
                {file ? file.name : 'Klikk for å laste opp'}
              </p>
              <p className="text-sm text-gray-400 mt-1">Excel (.xlsx) eller CSV (.csv)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Navnefilter (valgfritt)</h3>
            <Input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Ditt navn i filen (for å filtrere rader)"
            />
          </Card>

          <p className="text-sm text-gray-500">
            Forventede kolonner: <strong>Dato, Start, Slutt, Pause, Navn (valgfritt)</strong>
          </p>

          {errors.length > 0 && (
            <Card>
              {errors.map((err, i) => (
                <p key={i} className="text-red-500 text-sm flex items-start gap-1">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> {err}
                </p>
              ))}
            </Card>
          )}

          <Button fullWidth onClick={handlePreview} loading={loading} disabled={!file}>
            Forhåndsvis import
          </Button>
        </div>
      )}

      {step === 2 && preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{preview.length} vakter funnet</h3>
            <Button size="sm" variant="ghost" onClick={() => setStep(1)}>Tilbake</Button>
          </div>

          {errors.length > 0 && (
            <Card>
              <h4 className="font-semibold text-red-600 mb-2">Advarsler ({errors.length})</h4>
              {errors.map((err, i) => (
                <p key={i} className="text-red-500 text-sm">{err}</p>
              ))}
            </Card>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {preview.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 text-sm">
                <span className="text-gray-400 w-6 text-right">{i + 1}</span>
                <span className="font-medium text-gray-900 w-24">{s.date}</span>
                <span className="text-gray-600">{s.start_time}–{s.end_time}</span>
                <span className="text-gray-400">{s.pause_min}min pause</span>
              </div>
            ))}
          </div>

          <Button fullWidth onClick={handleConfirm} loading={loading}>
            Importer {preview.length} vakter
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-12 space-y-4">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">{imported} vakter importert!</h2>
          <p className="text-gray-500">Vaktene er lagt til i kalenderen din</p>
          <Button onClick={() => { setStep(1); setFile(null); setPreview(null) }} variant="secondary">
            Importer flere
          </Button>
        </div>
      )}
    </Layout>
  )
}
