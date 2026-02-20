export interface User {
  id: number
  email: string
  name: string
  workplace?: string
  position?: string
  employment_type?: string
  profile_image?: string
  is_admin: boolean
  is_active: boolean
  created_at: string
}

export interface WageSettings {
  id: number
  user_id: number
  hourly_rate: number
  evening_allowance_type: string
  evening_allowance_value: number
  evening_from: string
  evening_to: string
  night_allowance_type: string
  night_allowance_value: number
  night_from: string
  night_to: string
  weekend_allowance_type: string
  weekend_allowance_value: number
  holiday_allowance_type: string
  holiday_allowance_value: number
  custom_allowances: CustomAllowance[]
  overtime_daily_threshold: number
  overtime_weekly_threshold: number
  overtime_50_rate: number
  overtime_100_rate: number
  default_pause_min: number
  paid_pause: boolean
  rounding_minutes: number
  rounding_method: string
  tax_percent: number
  holiday_pay_percent: number
}

export interface CustomAllowance {
  name: string
  type: 'kr' | 'percent'
  value: number
}

export interface ShiftTemplate {
  id: number
  user_id: number
  code: string
  name: string
  start_time: string
  end_time: string
  pause_min: number
  color: string
  auto_allowances: boolean
}

export interface Shift {
  id: number
  user_id: number
  template_id?: number
  date: string
  start_time: string
  end_time: string
  pause_min: number
  note?: string
  total_hours: number
  base_hours: number
  evening_hours: number
  night_hours: number
  weekend_hours: number
  holiday_hours: number
  overtime_50_hours: number
  overtime_100_hours: number
  gross_pay: number
  is_holiday: boolean
  created_at: string
}

export interface MonthSummary {
  id: number
  user_id: number
  year: number
  month: number
  total_hours: number
  base_hours: number
  evening_hours: number
  night_hours: number
  weekend_hours: number
  holiday_hours: number
  overtime_50_hours: number
  overtime_100_hours: number
  gross_pay: number
  tax_deduction: number
  net_pay: number
  holiday_pay_base: number
  holiday_pay_earned: number
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface MonthCalcResult {
  year: number
  month: number
  shifts_count: number
  holidays: string[]
  total_hours: number
  base_hours: number
  evening_hours: number
  night_hours: number
  weekend_hours: number
  holiday_hours: number
  overtime_50_hours: number
  overtime_100_hours: number
  gross_pay: number
  tax_deduction: number
  net_pay: number
  holiday_pay_base: number
  holiday_pay_earned: number
}
