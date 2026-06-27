import { useEffect, useState } from 'react'
import client from '../../api/client'
import { FiDollarSign, FiShoppingBag, FiStar, FiTrendingUp, FiEye, FiPercent } from 'react-icons/fi'

export default function SellerStatisticsPage() {
  const [dashboard, setDashboard] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, statsRes] = await Promise.all([
          client.get('/seller/dashboard'),
          client.get('/seller/statistics')
        ])
        setDashboard(dashRes.data)
        setStats(statsRes.data)
      } catch (err) {
        console.error('Erreur statistiques:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
      Chargement des statistiques...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-sm text-gray-400 mt-1">Analysez vos performances de vente.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Chiffres clés dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: 'Chiffre d\'affaires', value: `${parseFloat(dashboard?.total_sales || 0).toLocaleString()} FCFA`, icon: <FiDollarSign size={22} className="text-green-600" />, bg: 'bg-green-50' },
            { label: 'Commandes totales', value: dashboard?.total_orders || 0, icon: <FiShoppingBag size={22} className="text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Note moyenne', value: `${parseFloat(dashboard?.average_rating || 0).toFixed(1)} / 5`, icon: <FiStar size={22} className="text-yellow-500" />, bg: 'bg-yellow-50' },
            { label: 'Vues produits', value: stats?.total_views || 0, icon: <FiEye size={22} className="text-purple-600" />, bg: 'bg-purple-50' },
            { label: 'Valeur moy. commande', value: `${parseFloat(stats?.average_order_value || 0).toLocaleString()} FCFA`, icon: <FiTrendingUp size={22} className="text-orange-500" />, bg: 'bg-orange-50' },
            { label: 'Taux de conversion', value: `${stats?.conversion_rate || 0}%`, icon: <FiPercent size={22} className="text-red-500" />, bg: 'bg-red-50' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Top produits */}
        {dashboard?.top_products?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Produits les plus vendus</h2>
            <div className="space-y-3">
              {dashboard.top_products.map((product, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#F5A623' }}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{product.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{product.sales_count} vente{product.sales_count > 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-400">{parseFloat(product.revenue || 0).toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commandes récentes */}
        {dashboard?.recent_orders?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Commandes récentes</h2>
            <div className="space-y-3">
              {dashboard.recent_orders.map((order, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-mono font-bold text-gray-800">{order.order_number}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#F5A623' }}>
                      {parseFloat(order.total || 0).toLocaleString()} FCFA
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                      order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                      order.status === 'confirmed' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status === 'delivered' ? 'Livré' :
                       order.status === 'shipped' ? 'Expédié' :
                       order.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ventes mensuelles */}
        {dashboard?.monthly_sales?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Ventes mensuelles</h2>
            <div className="space-y-3">
              {dashboard.monthly_sales.map((month, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-700">{month.month}</p>
                  <p className="text-sm font-bold" style={{ color: '#F5A623' }}>
                    {parseFloat(month.amount || 0).toLocaleString()} FCFA
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}