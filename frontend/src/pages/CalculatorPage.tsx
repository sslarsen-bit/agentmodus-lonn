import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Save, Lock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Card, StatCard } from '../components/ui/Card'
import { calculateMonth, saveMonth, listSummaries, lockSummary } from '../api/calculator'
import { MonthCalcResult, MonthSummary } from '../types'
import { MONTH_NAMES, formatMonthYear } from '../utils/dateUtils'
import { formatCurrency, formatHours } from '../utils/formatUtils'

export const CalculatorPage: React.FC = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [result, setResult] = useState<MonthCalcResult | null>(null)
  const [summaries, setSummaries] = useState<MonthSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'calc' | 'history'>('calc')

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const load = async () => {
    setLoading(true)
    const [r, s] = await Promise.all([calculateMonth(year, month), listSummaries()])
    setResult(r)
    setSummaries(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [year, month])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveMonth(year, month)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const handleLock = async (id: number) => {
    if (!confirm('Lås måneden? Dette kan ikke angres.')) return
    await lockSummary(id)
    await load()
  }

  const existingSummary = summaries.find(s => s.year === year && s.month === month)

  return (
    <Layout title="Lønnskalkulator">
      {/* Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-1 mb-4">
        {(['calc', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'calc' ? 'Beregn måned' : 'Historikk'}
          </button>
        ))}
      </div>

      {tab === 'calc' && (
        <>
          {/* Month selector */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prev} className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200">
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-bold text-gray-900">{MONTH_NAMES[month - 1]} {year}</h2>
            <button onClick={next} className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200">
              <ChevronRight size={20} />
            </button>
          </div>

          {loading && (
            <div className="text-center py-10 text-gray-400">Beregner...</div>
          )}

          {result && !loading && (
            <>
              {result.shifts_count === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">📊</p>
                  <p>Ingen vakter denne måneden</p>
                </div>
              ) : (
                <>
                  {/* Key stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatCard label="Bruttolønn" value={formatCurrency(result.gross_pay)} color="text-green-600" />
                    <StatCard label="Netto (est.)" value={formatCurrency(result.net_pay)} sub="estimat" />
                    <StatCard label="Skattetrekk" value={formatCurrency(result.tax_deduction)} sub="estimat" color="text-red-500" />
                    <StatCard label="Feriepenger" value={formatCurrency(result.holiday_pay_earned)} color="text-blue-600" />
                  </div>

                  {/* Hours breakdown */}
                  <Card className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-3">Timefordeling</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Totale timer', val: result.total_hours, bold: true },
                        { label: 'Grunntimer', val: result.base_hours },
                        { label: 'Kveldstimer', val: result.evening_hours },
                        { label: 'Nattimer', val: result.night_hours },
                        { label: 'Helgetimer', val: result.weekend_hours },
                        { label: 'Helligdagstimer', val: result.holiday_hours },
                        { label: 'Overtid 50%', val: result.overtime_50_hours },
                        { label: 'Overtid 100%', val: result.overtime_100_hours },
                      ].filter(r => r.val > 0 || r.bold).map(({ label, val, bold }) => (
                        <div key={label} className={`flex justify-between ${bold ? 'font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2' : 'text-gray-600'} text-sm`}>
                          <span>{label}</span>
                          <span>{formatHours(val)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Holidays */}
                  {result.holidays.length > 0 && (
                    <Card className="mb-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">Helligdager denne måneden</h3>
                      <div className="flex flex-wrap gap-1">
                        {result.holidays.map((h) => (
                          <span key={h} className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-lg border border-red-100">
                            {h}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {existingSummary?.is_locked ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                      <Lock size={20} className="inline text-green-500 mb-1" />
                      <p className="text-green-700 font-semibold text-sm">Måneden er låst</p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button fullWidth variant="secondary" onClick={handleSave} loading={saving}>
                        <Save size={16} className="inline -mt-0.5 mr-1" /> Lagre sammendrag
                      </Button>
                      {existingSummary && (
                        <Button onClick={() => handleLock(existingSummary.id)} variant="ghost">
                          <Lock size={16} />
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {summaries.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p>Ingen lagrede sammendrag ennå</p>
            </div>
          )}
          {summaries.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{MONTH_NAMES[s.month - 1]} {s.year}</p>
                    {s.is_locked && <Lock size={12} className="text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{formatHours(s.total_hours)} · {formatCurrency(s.gross_pay)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(s.net_pay)}</p>
                  <p className="text-xs text-gray-400">netto est.</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}
