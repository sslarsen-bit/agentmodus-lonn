import React from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<Props> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input
      className={`input ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
)

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select: React.FC<SelectProps> = ({ label, error, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select
      className={`input ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
)
