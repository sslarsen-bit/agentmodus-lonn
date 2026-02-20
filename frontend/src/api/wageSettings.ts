import api from './client'
import { WageSettings } from '../types'

export const getWageSettings = (): Promise<WageSettings> =>
  api.get('/wage-settings').then((r) => r.data)

export const updateWageSettings = (data: Partial<WageSettings>): Promise<WageSettings> =>
  api.patch('/wage-settings', data).then((r) => r.data)
