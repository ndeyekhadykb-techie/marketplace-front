import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import { FiDollarSign, FiPackage, FiShoppingBag, FiClipboard, FiMessageSquare, FiBarChart2 } from 'react-icons/fi'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_sales: 0,
    products_count: 0,
    pending_orders_count: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await client.get('/seller/dashboard')
        setStats(res.data)
      } catch (err) {
        console.error('Erreur dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

 const cards = [
  {
    label: "Chiffre d'affaires",
    value: loading ? '...' : `${parseFloat(stats.total_sales || 0).toLocaleString()} FCFA`,
    icon: <FiDollarSign size={22} className="text-green-600" />,
    bg: 'bg-green-50',
    border: 'border-green-100'
  },
  {
    label: 'Produits en ligne',
    value: loading ? '...' : `${stats.total_products || 0} articles`,
    icon: <FiPackage size={22} className="text-orange-500" />,
    bg: 'bg-orange-50',
    border: 'border-orange-100'
  },
  {
    label: 'Commandes à traiter',
    value: loading ? '...' : `${stats.pending_orders || 0} en attente`,
    icon: <FiShoppingBag size={22} className="text-yellow-500" />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-100'
  }
]

  const actions = [
    { label: 'Mes produits', to: '/seller/products', icon: <FiPackage size={22} /> },
    { label: 'Commandes', to: '/seller/orders', icon: <FiClipboard size={22} /> },
    { label: 'Messages', to: '/seller/messages', icon: <FiMessageSquare size={22} /> },
    { label: 'Statistiques', to: '/seller/statistics', icon: <FiBarChart2 size={22} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bonjour, <span className="text-yellow-500">{user?.name || 'Vendeur'}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Suivez vos ventes et gérez vos produits
            </p>
          </div>
          <Link
            to="/seller/products/new"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold px-5 py-3 rounded-xl transition-colors text-center"
          >
            + Ajouter un produit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border ${card.border} p-6 flex items-center justify-between shadow-sm`}
            >
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {actions.map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-center text-gray-600"
              >
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}