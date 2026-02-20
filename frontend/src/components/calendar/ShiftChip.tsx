import React from 'react'
import { Shift, ShiftTemplate } from '../../types'

interface Props {
  shift: Shift
  template?: ShiftTemplate
  onClick?: () => void
}

export const ShiftChip: React.FC<Props> = ({ shift, template, onClick }) => {
  const color = template?.color || '#4F46E5'
  return (
    <div
      onClick={onClick}
      className="rounded-lg px-1.5 py-0.5 text-white text-[10px] font-medium cursor-pointer truncate"
      style={{ backgroundColor: color }}
      title={`${shift.start_time}–${shift.end_time} (${shift.total_hours.toFixed(1)}t)`}
    >
      {template ? template.code : shift.start_time}
    </div>
  )
}
