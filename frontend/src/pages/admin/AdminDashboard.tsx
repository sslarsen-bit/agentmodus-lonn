import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { StatCard } from '../../components/ui/Card'
import { getStats } from '../../api/admin'

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  return (
    <AdminLayout title="Oversikt">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Totalt brukere" value={stats?.total_users ?? '–'} />
        <StatCard label="Aktive brukere" value={stats?.active_users ?? '–'} color="text-green-600" />
        <StatCard label="Registrerte vakter" value={stats?.total_shifts ?? '–'} color="text-blue-600" />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-2">Om adminpanelet</h2>
        <p className="text-gray-500 text-sm">
          Her kan du se alle registrerte brukere, se profilinformasjon, deaktivere eller slette brukere.
          Brukeres lønnsdata er ikke tilgjengelig i adminpanelet (personvern).
        </p>
      </div>
    </AdminLayout>
  )
}
