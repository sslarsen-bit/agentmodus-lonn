import api from './client'
import { ShiftTemplate } from '../types'

export const listTemplates = (): Promise<ShiftTemplate[]> =>
  api.get('/shift-templates').then((r) => r.data)

export const createTemplate = (data: Omit<ShiftTemplate, 'id' | 'user_id'>): Promise<ShiftTemplate> =>
  api.post('/shift-templates', data).then((r) => r.data)

export const updateTemplate = (id: number, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> =>
  api.patch(`/shift-templates/${id}`, data).then((r) => r.data)

export const deleteTemplate = (id: number): Promise<void> =>
  api.delete(`/shift-templates/${id}`).then((r) => r.data)
