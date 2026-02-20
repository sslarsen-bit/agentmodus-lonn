import React from 'react'
import { BottomNav } from './BottomNav'

interface Props {
  children: React.ReactNode
  title?: string
  headerRight?: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children, title, headerRight }) => (
  <div className="min-h-screen bg-gray-50 pb-20">
    {title && (
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {headerRight && <div>{headerRight}</div>}
      </header>
    )}
    <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
    <BottomNav />
  </div>
)
