import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, login, getMe } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gdpr, setGdpr] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gdpr) { setError('Du må godta personvernerklæringen'); return }
    if (password.length < 8) { setError('Passordet må være minst 8 tegn'); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, name, gdpr)
      const { access_token } = await login(email, password)
      setToken(access_token)
      const user = await getMe()
      setUser(user)
      navigate('/calendar')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Feil ved registrering')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Registrer deg</h1>
          <p className="text-gray-500 mt-1">Opprett din konto gratis</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <Input
            label="Fullt navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ola Nordmann"
            required
          />
          <Input
            label="E-post"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deg@eksempel.no"
            required
          />
          <Input
            label="Passord (minst 8 tegn)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={gdpr}
              onChange={(e) => setGdpr(e.target.checked)}
              className="mt-1 rounded"
            />
            <span className="text-sm text-gray-600">
              Jeg godtar{' '}
              <span className="text-primary-600 underline">personvernerklæringen</span> og
              samtykker til lagring av mine data (GDPR)
            </span>
          </label>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Registrer deg
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Har du allerede konto?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  )
}
