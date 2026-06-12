import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../../services/orders'
import { PageLoader } from '../../components/ui/Spinner'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Layout } from '../../components/layout/Layout'

// Couleur et label selon le statut de la commande
function StatusBadge({ status }) {
  const styles = {
    pending:   'bg-yellow-100 text-yellow-700',
    shipped:   'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const labels = {
    pending:   'En attente',
    shipped:   'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  }

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadOrders() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getMyOrders()
      setOrders(data.data ?? data)
    } catch {
      setError('Impossible de charger vos commandes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <ErrorMessage message={error} retry={loadOrders} />

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore de commandes.</p>
          <Link
            to="/products"
            className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between mb-3">
                {/* Numéro de commande */}
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    Commande #{order.order_number}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Aperçu des articles */}
              <div className="flex flex-col gap-1 mb-3">
                {order.items?.slice(0, 2).map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-4">
                      {item.product?.title}
                      <span className="text-gray-400"> x{item.quantity}</span>
                    </span>
                    <span className="text-gray-800 font-medium flex-none">
                      {Number(item.subtotal).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
                {/* Si plus de 2 articles */}
                {order.items?.length > 2 && (
                  <p className="text-xs text-gray-400">
                    + {order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''} article{order.items.length - 2 > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Total + lien détail */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-amber-500">
                  {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-xs text-amber-500 font-medium">
                  Voir le détail →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}