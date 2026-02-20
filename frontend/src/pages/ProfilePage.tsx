import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save, ChevronRight, Download } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useAuthStore } from '../store/authStore'
import { getMe, updateMe, deleteMe } from '../api/auth'
import { getWageSettings, updateWageSettings } from '../api/wageSettings'
import { WageSettings } from '../types'

export const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'profile' | 'wage' | 'export'>('profile')

  // Profile
  const [name, setName] = useState(user?.name || '')
  const [workplace, setWorkplace] = useState(user?.workplace || '')
  const [position, setPosition] = useState(user?.position || '')
  const [employment_type, setEmploymentType] = useState(user?.employment_type || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Wage settings
  const [ws, setWs] = useState<WageSettings | null>(null)
  const [wageSaving, setWageSaving] = useState(false)
  const [wageMsg, setWageMsg] = useState('')

  useEffect(() => {
    getWageSettings().then(setWs)
  }, [])

  const handleProfileSave = async () => {
    setProfileSaving(true); setProfileMsg('')
    try {
      const updated = await updateMe({ name, workplace, position, employment_type })
      setUser(updated)
      setProfileMsg('Profil lagret!')
    } catch { setProfileMsg('Feil ved lagring') }
    finally { setProfileSaving(false); setTimeout(() => setProfileMsg(''), 2500) }
  }

  const handleWageSave = async () => {
    if (!ws) return
    setWageSaving(true); setWageMsg('')
    try {
      const updated = await updateWageSettings(ws)
      setWs(updated)
      setWageMsg('Lønnsinnstillinger lagret!')
    } catch { setWageMsg('Feil ved lagring') }
    finally { setWageSaving(false); setTimeout(() => setWageMsg(''), 2500) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const handleDeleteAccount = async () => {
    if (!confirm('Er du sikker? Alle dine data vil bli permanent slettet (GDPR).')) return
    await deleteMe()
    logout()
    navigate('/login')
  }

  const wsSet = (key: keyof WageSettings, val: any) =>
    setWs((prev) => prev ? { ...prev, [key]: val } : prev)

  return (
    <Layout title="Profil & Innstillinger">
      {/* Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-1 mb-4">
        {(['profile', 'wage', 'export'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t === 'profile' ? 'Profil' : t === 'wage' ? 'Lønn' : 'Eksport'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-xl">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input label="Navn" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Arbeidssted / Arbeidsgiver" value={workplace} onChange={(e) => setWorkplace(e.target.value)} placeholder="Valgfritt" />
              <Input label="Stilling" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Valgfritt" />
              <Select label="Ansettelsestype" value={employment_type} onChange={(e) => setEmploymentType(e.target.value)}>
                <option value="">Velg...</option>
                <option value="timebetalt">Timebetalt</option>
                <option value="fast">Fast stilling</option>
                <option value="deltid">Deltid</option>
                <option value="vikar">Vikar</option>
              </Select>
            </div>
            {profileMsg && <p className="text-green-600 text-sm mt-2">{profileMsg}</p>}
            <Button fullWidth onClick={handleProfileSave} loading={profileSaving} className="mt-4">
              <Save size={16} className="inline -mt-0.5 mr-1" /> Lagre profil
            </Button>
          </Card>

          <Card>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full text-red-500 hover:text-red-600 font-medium py-1">
              <LogOut size={18} /> Logg ut
            </button>
          </Card>

          <Card>
            <button onClick={handleDeleteAccount} className="flex items-center gap-3 w-full text-red-400 hover:text-red-500 text-sm py-1">
              Slett konto og alle data (GDPR)
            </button>
          </Card>
        </div>
      )}

      {tab === 'wage' && ws && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Grunnlønn</h3>
            <Input
              label="Timesats (kr/time)"
              type="number"
              value={ws.hourly_rate}
              onChange={(e) => wsSet('hourly_rate', Number(e.target.value))}
              min={0}
            />
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Tillegg</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input label="Kveldstillegg (kr/t)" type="number" value={ws.evening_allowance_value}
                    onChange={(e) => wsSet('evening_allowance_value', Number(e.target.value))} min={0} />
                </div>
                <div>
                  <Input label="Fra" type="time" value={ws.evening_from} onChange={(e) => wsSet('evening_from', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input label="Nattillegg (kr/t)" type="number" value={ws.night_allowance_value}
                    onChange={(e) => wsSet('night_allowance_value', Number(e.target.value))} min={0} />
                </div>
                <div>
                  <Input label="Fra" type="time" value={ws.night_from} onChange={(e) => wsSet('night_from', e.target.value)} />
                </div>
              </div>
              <Input label="Helgetillegg (kr/t)" type="number" value={ws.weekend_allowance_value}
                onChange={(e) => wsSet('weekend_allowance_value', Number(e.target.value))} min={0} />
              <Input label="Helligdagstillegg (kr/t)" type="number" value={ws.holiday_allowance_value}
                onChange={(e) => wsSet('holiday_allowance_value', Number(e.target.value))} min={0} />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Overtid</h3>
            <div className="space-y-3">
              <Input label="Daglig terskel (timer)" type="number" value={ws.overtime_daily_threshold}
                onChange={(e) => wsSet('overtime_daily_threshold', Number(e.target.value))} min={0} step={0.5} />
              <Input label="Ukentlig terskel (timer)" type="number" value={ws.overtime_weekly_threshold}
                onChange={(e) => wsSet('overtime_weekly_threshold', Number(e.target.value))} min={0} step={0.5} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="OT50 multiplikator" type="number" value={ws.overtime_50_rate}
                  onChange={(e) => wsSet('overtime_50_rate', Number(e.target.value))} step={0.1} min={1} />
                <Input label="OT100 multiplikator" type="number" value={ws.overtime_100_rate}
                  onChange={(e) => wsSet('overtime_100_rate', Number(e.target.value))} step={0.1} min={1} />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Pause & Avrunding</h3>
            <div className="space-y-3">
              <Input label="Standard pause (min)" type="number" value={ws.default_pause_min}
                onChange={(e) => wsSet('default_pause_min', Number(e.target.value))} min={0} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ws.paid_pause}
                  onChange={(e) => wsSet('paid_pause', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Betalt pause</span>
              </label>
              <Input label="Avrunding (minutter, 0 = ingen)" type="number" value={ws.rounding_minutes}
                onChange={(e) => wsSet('rounding_minutes', Number(e.target.value))} min={0} step={5} />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">Skatt & Feriepenger</h3>
            <div className="space-y-3">
              <Input label="Skatteprosent (estimat)" type="number" value={ws.tax_percent}
                onChange={(e) => wsSet('tax_percent', Number(e.target.value))} min={0} max={100} step={0.5} />
              <Input label="Feriepengeprosent" type="number" value={ws.holiday_pay_percent}
                onChange={(e) => wsSet('holiday_pay_percent', Number(e.target.value))} min={0} max={30} step={0.1} />
            </div>
            <p className="text-xs text-gray-400 mt-2">* Skattetrekk er kun estimat og erstatter ikke offisielt lønnssystem</p>
          </Card>

          {wageMsg && <p className="text-green-600 text-sm text-center">{wageMsg}</p>}
          <Button fullWidth onClick={handleWageSave} loading={wageSaving}>
            <Save size={16} className="inline -mt-0.5 mr-1" /> Lagre lønnsinnstillinger
          </Button>
        </div>
      )}

      {tab === 'export' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Gå til Import-/Eksportsiden for å laste ned eller importere data.</p>
          <Card onClick={() => navigate('/import')} className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Importer vakter</p>
                <p className="text-sm text-gray-500">Fra Excel eller CSV-fil</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </Card>
          <Card onClick={() => navigate('/export')} className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Eksporter rapport</p>
                <p className="text-sm text-gray-500">PDF, Excel eller CSV</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}
