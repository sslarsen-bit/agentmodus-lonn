import React, { useEffect, useState } from 'react'
import { Search, UserX, UserCheck, Trash2, Eye } from 'lucide-react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { User } from '../../types'
import { listUsers, getUser, deactivateUser, activateUser, deleteUser } from '../../api/admin'

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await listUsers(search || undefined)
    setUsers(data)
  }

  useEffect(() => { load() }, [search])

  const handleDeactivate = async (id: number) => {
    await deactivateUser(id)
    load()
    if (selected?.id === id) setSelected(null)
  }

  const handleActivate = async (id: number) => {
    await activateUser(id)
    load()
    if (selected?.id === id) setSelected(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Slett brukeren permanent? Alle data slettes.')) return
    await deleteUser(id)
    load()
    if (selected?.id === id) setSelected(null)
  }

  const openUser = async (id: number) => {
    const u = await getUser(id)
    setSelected(u)
  }

  const formatDate = (str: string) => new Date(str).toLocaleDateString('nb-NO')

  return (
    <AdminLayout title="Brukere">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Søk på navn, e-post eller arbeidssted..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Navn</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">E-post</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden md:table-cell">Registrert</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    {u.workplace && <p className="text-xs text-gray-400">{u.workplace}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {u.is_active ? 'Aktiv' : 'Deaktivert'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openUser(u.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Ingen brukere funnet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Brukerdetaljer">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-xl">
                {selected.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{selected.name}</p>
                <p className="text-gray-500">{selected.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Arbeidssted', val: selected.workplace || '–' },
                { label: 'Stilling', val: selected.position || '–' },
                { label: 'Ansettelsestype', val: selected.employment_type || '–' },
                { label: 'Registrert', val: new Date(selected.created_at).toLocaleDateString('nb-NO') },
                { label: 'Status', val: selected.is_active ? 'Aktiv' : 'Deaktivert' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              {selected.is_active ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeactivate(selected.id)}
                >
                  <UserX size={14} className="inline mr-1" /> Deaktiver
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleActivate(selected.id)}
                >
                  <UserCheck size={14} className="inline mr-1" /> Aktiver
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selected.id)}
              >
                <Trash2 size={14} className="inline mr-1" /> Slett
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}
