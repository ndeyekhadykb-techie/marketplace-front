import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../../services/orders'
import { PageLoader } from '../../components/ui/Spinner'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Layout } from '../../components/layout/Layout'

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

// Ligne de timeline pour suivre l'état de la commande
function TimelineStep({ label, date, done, active }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-4 h-4 rounded-full flex-none mt-0.5 border-2 transition-colors
        ${done || active
          ? 'bg-amber-400 border-amber-400'
          : 'bg-white border-gray-200'
        }`}
      />
      <div>
        <p className={`text-sm font-medium ${active ? 'text-amber-500' : done ? 'text-gray-800' : 'text-gray-400'}`}>
          {label}
        </p>
        {date && (
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(date).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadOrder() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getOrder(id)
      setOrder(data.data ?? data)
    } catch {
      setError('Impossible de charger la commande.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  if (loading) return <Layout><PageLoader /></Layout>
  if (error)   return <Layout><ErrorMessage message={error} retry={loadOrder} /></Layout>
  if (!order)  return null

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/orders"
            className="text-sm text-gray-400 hover:text-amber-500 transition-colors mb-1 block"
          >
            ← Mes commandes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Commande #{order.order_number}
          </h1>
          <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Colonne gauche ── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Articles */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Articles commandés</h2>
            <div className="flex flex-col gap-4">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={item.product?.image ?? 'https://placehold.co/64x64?text=P'}
                    alt={item.product?.title}
                    onError={e => { e.target.src = 'https://placehold.co/64x64?text=P' }}
                    className="w-16 h-16 rounded-xl object-cover flex-none"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {item.product?.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Vendeur : {item.seller?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {Number(item.unit_price).toLocaleString('fr-FR')} FCFA x {item.quantity}
                    </p>
                  </div>
                  <div className="flex-none text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      {Number(item.subtotal).toLocaleString('fr-FR')} FCFA
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Adresse de livraison</h2>
            <div className="text-sm text-gray-600 flex flex-col gap-1">
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city} {order.shipping_postal_code}</p>
              <p>{order.shipping_phone}</p>
            </div>
            {order.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Suivi commande */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Suivi de la commande</h2>
            <div className="flex flex-col gap-4 relative">
              {/* Ligne verticale */}
              <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-gray-100" />

              <TimelineStep
                label="Commande passée"
                date={order.created_at}
                done={true}
              />
              <TimelineStep
                label="En cours de traitement"
                done={['shipped', 'delivered'].includes(order.status)}
                active={order.status === 'pending'}
              />
              <TimelineStep
                label="Expédiée"
                date={order.shipped_at}
                done={['shipped', 'delivered'].includes(order.status)}
                active={order.status === 'shipped'}
              />
              <TimelineStep
                label="Livrée"
                date={order.delivered_at}
                done={order.status === 'delivered'}
                active={order.status === 'delivered'}
              />
            </div>
          </div>

        </div>

        {/* ── Résumé financier ── */}
        <div className="lg:w-72 flex-none">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Résumé financier</h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>
                  {Number(order.total_amount - order.shipping_cost + order.discount_amount).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Réduction</span>
                  <span>- {Number(order.discount_amount).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>
                  {order.shipping_cost > 0
                    ? `${Number(order.shipping_cost).toLocaleString('fr-FR')} FCFA`
                    : 'Gratuite'
                  }
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total payé</span>
                <span className="text-amber-500">
                  {Number(order.total_amount).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Date de commande */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
              <p>Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}</p>
              {order.shipped_at && (
                <p className="mt-1">Expédié le {new Date(order.shipped_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}</p>
              )}
              {order.delivered_at && (
                <p className="mt-1">Livré le {new Date(order.delivered_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}