import React, { useState } from 'react'
import { FileText, Table, Download } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { MONTH_NAMES } from '../utils/dateUtils'

export const ExportPage: React.FC = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setLoading(format)
    const token = localStorage.getItem('token')
    const url = `/api/export/${format}?year=${year}&month=${month}`
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      const ext = format === 'excel' ? 'xlsx' : format
      a.download = `vakter_${year}_${String(month).padStart(2, '0')}.${ext}`
      a.click()
    } finally {
      setLoading(null)
    }
  }

  const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]

  return (
    <Layout title="Eksporter rapport">
      <div className="space-y-4">
        <Card>
          <h3 className="font-bold text-gray-900 mb-3">Velg periode</h3>
          <div className="grid grid-cols-2 gap-3">
            <Select label="År" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Select label="Måned" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </Select>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Eksporterer alle vakter i {MONTH_NAMES[month - 1]} {year}
          </p>
        </Card>

        <h3 className="font-semibold text-gray-700">Velg format</h3>

        <div className="space-y-3">
          {[
            {
              format: 'pdf' as const,
              icon: FileText,
              title: 'PDF-rapport',
              desc: 'Oversiktlig rapport med sammendrag, egnet for å sende til sjef',
              color: 'text-red-500',
            },
            {
              format: 'excel' as const,
              icon: Table,
              title: 'Excel (.xlsx)',
              desc: 'Detaljert vaktliste med sammendrag-ark, egnet for regnskap',
              color: 'text-green-600',
            },
            {
              format: 'csv' as const,
              icon: Download,
              title: 'CSV',
              desc: 'Enkel kommaseparert fil for import til andre systemer',
              color: 'text-blue-500',
            },
          ].map(({ format, icon: Icon, title, desc, color }) => (
            <Card key={format} className="flex items-center gap-4">
              <Icon size={28} className={`${color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleExport(format)}
                loading={loading === format}
              >
                Last ned
              </Button>
            </Card>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">Tips: Send til sjef</p>
          <p>Last ned PDF-rapporten og del den via e-post eller Messenger. Rapporten inneholder oversiktlig lønnssammendrag.</p>
        </div>
      </div>
    </Layout>
  )
}
