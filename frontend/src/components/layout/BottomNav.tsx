import React from 'react'
import { NavLink } from 'react-router-dom'
import { Calendar, Timer, Tag, Calculator, User } from 'lucide-react'

const navItems = [
  { to: '/calendar', icon: Calendar, label: 'Kalender' },
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/shift-codes', icon: Tag, label: 'Vaktkoder' },
  { to: '/calculator', icon: Calculator, label: 'Kalkulator' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export const BottomNav: React.FC = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
    <div className="flex justify-around items-center max-w-lg mx-auto">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-3 px-2 flex-1 transition-colors ${
              isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Icon size={22} strokeWidth={isActive => (isActive ? 2.5 : 1.8)} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
)
