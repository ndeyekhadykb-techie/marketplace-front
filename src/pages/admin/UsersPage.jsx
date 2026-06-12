import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import client from '../../api/client'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await client.get('/admin/users')
        setUsers(res.data?.data || res.data || [])
      } catch (err) {
        console.error('Erreur users:', err)
        toast.error('Impossible de charger les utilisateurs.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleSuspend = async (userId) => {
    try {
      await client.post(`/admin/users/${userId}/suspend`)
      setUsers(users.map(u => u.id === userId ? { ...u, suspended_at: new Date() } : u))
      toast.success('Utilisateur suspendu !')
    } catch (err) {
      toast.error('Erreur lors de la suspension.')
    }
  }

  const handleActivate = async (userId) => {
    try {
      await client.post(`/admin/users/${userId}/activate`)
      setUsers(users.map(u => u.id === userId ? { ...u, suspended_at: null } : u))
      toast.success('Utilisateur réactivé !')
    } catch (err) {
      toast.error('Erreur lors de la réactivation.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez les comptes de la marketplace.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Nom</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Rôle</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                        user.role === 'seller' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        user.suspended_at ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                      }`}>
                        {user.suspended_at ? 'Suspendu' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'admin' && (
                        user.suspended_at ? (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="text-xs font-semibold px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          >
                            Réactiver
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                          >
                            Suspendre
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}