import api from './client'
import { User } from '../types'

export const getStats = () => api.get('/admin/stats').then((r) => r.data)
export const listUsers = (search?: string) =>
  api.get('/admin/users', { params: { search } }).then((r) => r.data as User[])
export const getUser = (id: number) => api.get(`/admin/users/${id}`).then((r) => r.data as User)
export const deactivateUser = (id: number) => api.patch(`/admin/users/${id}/deactivate`).then((r) => r.data)
export const activateUser = (id: number) => api.patch(`/admin/users/${id}/activate`).then((r) => r.data)
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`).then((r) => r.data)
