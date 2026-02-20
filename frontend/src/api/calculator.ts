import api from './client'
import { MonthCalcResult, MonthSummary } from '../types'

export const calculateMonth = (year: number, month: number): Promise<MonthCalcResult> =>
  api.get('/calculator/month', { params: { year, month } }).then((r) => r.data)

export const saveMonth = (year: number, month: number): Promise<MonthSummary> =>
  api.post('/calculator/month/save', { year, month }).then((r) => r.data)

export const listSummaries = (): Promise<MonthSummary[]> =>
  api.get('/calculator/summaries').then((r) => r.data)

export const lockSummary = (id: number): Promise<MonthSummary> =>
  api.post(`/calculator/summaries/${id}/lock`).then((r) => r.data)
