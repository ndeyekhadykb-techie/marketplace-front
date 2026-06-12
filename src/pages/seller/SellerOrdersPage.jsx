import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import client from '../../api/client'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await client.get('/seller/orders')
        setOrders(res.data?.data || res.data || [])
      } catch (err) {
        console.error('Erreur commandes:', err)
        toast.error('Erreur lors de la récupération des commandes.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'shipped' : 'delivered'
    try {
      await client.put(`/orders/${orderId}/status`, { status: nextStatus })
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o))
      toast.success('Statut mis à jour !')
    } catch (err) {
      console.error(err)
      toast.error('Impossible de modifier le statut.')
    }
  }

  const statusConfig = {
    pending:   { label: 'En attente',  classes: 'bg-amber-50 text-amber-600 border-amber-100' },
    shipped:   { label: 'Expédié',     classes: 'bg-blue-50 text-blue-600 border-blue-100' },
    delivered: { label: 'Livré',       classes: 'bg-green-50 text-green-600 border-green-100' },
    cancelled: { label: 'Annulé',      classes: 'bg-gray-100 text-gray-500 border-gray-200' },
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Suivez les achats de vos clients et gérez vos expéditions.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Chargement des commandes...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <span className="text-5xl block mb-4">🧾</span>
            <p className="text-gray-500 font-medium">Aucune commande reçue pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-2">

                    {/* ID + Statut */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                        #{order.id}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${status.classes}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Client */}
                    <p className="text-sm text-gray-500">
                      Client :{' '}
                      <span className="font-semibold text-gray-800">
                        {order.user?.name || `#${order.user_id}`}
                      </span>
                    </p>

                    {/* Produits */}
                    {order.items?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                          >
                            {item.product?.title || 'Produit'} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    <p className="text-lg font-black text-red-500">
                      {parseFloat(order.total_amount || 0).toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Bouton action */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                    >
                      {order.status === 'pending' ? '📦 Marquer expédié' : '✅ Marquer livré'}
                    </button>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}