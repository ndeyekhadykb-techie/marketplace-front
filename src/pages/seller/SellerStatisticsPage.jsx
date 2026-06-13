import { useEffect, useState } from 'react'
import client from '../../api/client'
import { FiDollarSign, FiFileText, FiPackage, FiStar, FiAward, FiClock } from 'react-icons/fi'

export default function SellerStatisticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await client.get('/seller/statistics')
        setStats(res.data)
      } catch (err) {
        console.error('Erreur statistiques:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
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

        {/* Chiffres clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Revenus totaux', value: `${parseFloat(stats?.total_revenue || 0).toLocaleString()} FCFA`, icon: <FiDollarSign size={20} />, bg: 'bg-green-50', text: 'text-green-600' },
            { label: 'Commandes totales', value: stats?.total_orders || 0, icon: <FiFileText size={20} />, bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Produits vendus', value: stats?.total_products_sold || 0, icon: <FiPackage size={20} />, bg: 'bg-orange-50', text: 'text-orange-600' },
            { label: 'Note moyenne', value: stats?.average_rating ? `${parseFloat(stats.average_rating).toFixed(1)}` : 'N/A', icon: <FiStar size={20} />, bg: 'bg-yellow-50', text: 'text-yellow-600' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.text}`}>{card.value} {card.label === 'Note moyenne' && stats?.average_rating && '⭐'}</p>
              </div>
              <div className={`${card.bg} ${card.text} p-3 rounded-xl`}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Produits les plus vendus */}
        {stats?.top_products?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiAward className="text-yellow-500" size={18} /> Produits les plus vendus
            </h2>
            <div className="space-y-3">
              {stats.top_products.map((product, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span 
                      style={{ backgroundColor: '#FFF6E6', color: '#F5A623' }} 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{product.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{product.sales_count} ventes</p>
                    <p className="text-xs text-gray-400">{parseFloat(product.price || 0).toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commandes récentes */}
        {stats?.recent_orders?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-gray-500" size={18} /> Commandes récentes
            </h2>
            <div className="space-y-3">
              {stats.recent_orders.map((order, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Commande #{order.id}</p>
                    <p className="text-xs text-gray-400">{order.user?.name || 'Client'}</p>
                  </div>
                  <p style={{ color: '#F5A623' }} className="text-sm font-bold">
                    {parseFloat(order.total_amount || 0).toLocaleString()} FCFA
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