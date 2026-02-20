import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { getMe } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token, is_admin } = await login(email, password)
      setToken(access_token)
      const user = await getMe()
      setUser(user)
      navigate(is_admin ? '/admin' : '/calendar')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Feil ved innlogging')
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
          <h1 className="text-3xl font-bold text-gray-900">Lønnsapp</h1>
          <p className="text-gray-500 mt-1">Logg inn på kontoen din</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <Input
            label="E-post"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deg@eksempel.no"
            autoComplete="email"
            required
          />
          <Input
            label="Passord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Logg inn
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Ny bruker?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  )
}
