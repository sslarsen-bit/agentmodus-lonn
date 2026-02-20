import api from './client'
import { User } from '../types'

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const register = (email: string, password: string, name: string, gdpr_accepted: boolean) =>
  api.post('/auth/register', { email, password, name, gdpr_accepted }).then((r) => r.data)

export const getMe = (): Promise<User> =>
  api.get('/users/me').then((r) => r.data)

export const updateMe = (data: Partial<User>): Promise<User> =>
  api.patch('/users/me', data).then((r) => r.data)

export const deleteMe = () =>
  api.delete('/users/me').then((r) => r.data)
