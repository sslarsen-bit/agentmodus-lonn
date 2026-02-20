import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface Props {
  children: React.ReactNode
  title: string
}

export const AdminLayout: React.FC<Props> = ({ children, title }) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        <div className="p-5 border-b border-gray-100">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Admin</span>
          <p className="text-lg font-bold text-gray-900 mt-0.5">Lønnsapp</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { to: '/admin', icon: LayoutDashboard, label: 'Oversikt' },
            { to: '/admin/users', icon: Users, label: 'Brukere' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors"
          >
            <LogOut size={18} />
            Logg ut
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56">
        <header className="bg-white border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
