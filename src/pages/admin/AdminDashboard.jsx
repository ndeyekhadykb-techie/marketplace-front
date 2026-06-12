import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await client.get('/admin/stats')
        setStats(res.data)
      } catch (err) {
        console.error('Erreur stats admin:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Panneau d'administration</h1>
          <p className="text-sm text-gray-400 mt-1">Vue globale de la marketplace.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Utilisateurs', value: loading ? '...' : stats?.total_users || 0, icon: '👥', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Produits', value: loading ? '...' : stats?.total_products || 0, icon: '📦', bg: 'bg-orange-50', text: 'text-orange-600' },
            { label: 'Commandes', value: loading ? '...' : stats?.total_orders || 0, icon: '🧾', bg: 'bg-green-50', text: 'text-green-600' },
            { label: 'Revenus', value: loading ? '...' : `${parseFloat(stats?.total_revenue || 0).toLocaleString()} FCFA`, icon: '💰', bg: 'bg-red-50', text: 'text-red-500' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.text}`}>{card.value}</p>
              </div>
              <div className={`${card.bg} text-2xl p-3 rounded-xl`}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Utilisateurs', to: '/admin/users', icon: '👥' },
              { label: 'Produits', to: '/admin/products', icon: '📦' },
              { label: 'Coupons', to: '/admin/coupons', icon: '🎟️' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors text-center"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-medium text-gray-600">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}