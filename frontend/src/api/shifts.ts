import api from './client'
import { Shift } from '../types'

export const listShifts = (year?: number, month?: number): Promise<Shift[]> =>
  api.get('/shifts', { params: { year, month } }).then((r) => r.data)

export const createShift = (data: {
  date: string
  start_time: string
  end_time: string
  pause_min?: number
  template_id?: number
  note?: string
}): Promise<Shift> => api.post('/shifts', data).then((r) => r.data)

export const updateShift = (id: number, data: Partial<Shift>): Promise<Shift> =>
  api.patch(`/shifts/${id}`, data).then((r) => r.data)

export const deleteShift = (id: number): Promise<void> =>
  api.delete(`/shifts/${id}`).then((r) => r.data)
