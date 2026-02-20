import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card: React.FC<Props> = ({ children, className = '', onClick }) => (
  <div
    className={`card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color = 'text-primary-600' }) => (
  <div className="card text-center">
    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
)
