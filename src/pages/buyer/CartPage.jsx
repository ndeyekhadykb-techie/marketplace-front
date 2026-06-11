import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { PageLoader } from '../../components/ui/Spinner'
import { Layout } from '../../components/layout/Layout'

export default function CartPage() {
  const { items, loading, fetchCart, updateItem, removeItem, clearCart, total } = useCart()
  const { user } = useAuth()
  const { toast, ToastContainer } = useToast()
  const navigate = useNavigate()

  // On charge le panier depuis l'API au montage de la page
  useEffect(() => {
    fetchCart()
  }, [])

  async function handleUpdateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) return
    try {
      await updateItem(cartItemId, newQuantity)
    } catch {
      toast('Erreur lors de la mise à jour', 'error')
    }
  }

  async function handleRemove(cartItemId) {
    try {
      await removeItem(cartItemId)
      toast('Produit retiré du panier', 'success')
    } catch {
      toast('Erreur lors de la suppression', 'error')
    }
  }

  async function handleClear() {
    try {
      await clearCart()
      toast('Panier vidé', 'success')
    } catch {
      toast('Erreur lors du vidage', 'error')
    }
  }

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <ToastContainer />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      {items.length === 0 ? (
        // ── Panier vide ──
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-gray-500 mb-6">Votre panier est vide.</p>
          <Link
            to="/products"
            className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Liste des articles ── */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Bouton vider le panier */}
            <div className="flex justify-end">
              <button
                onClick={handleClear}
                className="text-sm text-red-400 hover:text-red-500 transition-colors"
              >
                Vider le panier
              </button>
            </div>

            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center"
              >
                {/* Image produit */}
                <img
                  src={item.product?.image ?? 'https://placehold.co/80x80?text=P'}
                  alt={item.product?.title}
                  onError={e => { e.target.src = 'https://placehold.co/80x80?text=P' }}
                  className="w-20 h-20 rounded-xl object-cover flex-none"
                />

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {item.product?.title}
                  </h3>
                  <p className="text-amber-500 font-bold mt-1">
                    {Number(item.price_at_add).toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Sous-total : {Number(item.price_at_add * item.quantity).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {/* Contrôle quantité */}
                <div className="flex items-center gap-2 flex-none">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full border border-gray-200 hover:border-amber-400
                      hover:text-amber-500 flex items-center justify-center transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 hover:border-amber-400
                      hover:text-amber-500 flex items-center justify-center transition-colors text-gray-600"
                  >
                    +
                  </button>
                </div>

                {/* Supprimer */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-none ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ── Résumé commande ── */}
          <div className="lg:w-72 flex-none">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Résumé</h2>

              <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Articles ({items.length})</span>
                  <span>{Number(total).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span>
                  <span className="text-green-500">Calculée au checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-amber-500">
                    {Number(total).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold
                  py-3 rounded-xl transition-colors"
              >
                Passer la commande →
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3 transition-colors"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>

        </div>
      )}
    </Layout>
  )
}