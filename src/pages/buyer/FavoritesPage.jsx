import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFavorites, removeFavorite } from '../../services/favorites'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/ui/Spinner'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Layout } from '../../components/layout/Layout'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addItem } = useCart()
  const { user } = useAuth()

  async function loadFavorites() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getFavorites()
      console.log('favoris:', data)
      setFavorites(data.data ?? data)
    } catch {
      setError('Impossible de charger vos favoris.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  async function handleRemove(productId) {
    try {
      await removeFavorite(productId)
      // On retire le favori de la liste sans recharger toute la page
      setFavorites(prev => prev.filter(f => f.product?.id !== productId))
      toast.success('Retiré des favoris')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  async function handleAddToCart(productId) {
    try {
      await addItem(productId)
      toast.success('Ajouté au panier !')
    } catch {
      toast.error("Erreur lors de l'ajout")
    }
  }

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <ErrorMessage message={error} retry={loadFavorites} />

      {favorites.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore de favoris.</p>
          <Link
            to="/products"
            className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {favorites.map(fav => (
            <div key={fav.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">

                {/* Image */}
                <div className="relative overflow-hidden h-48">
                <img
                    src={(fav.image ?? '').replace('http://localhost/', 'http://localhost:8000/') || 'https://placehold.co/400x300?text=Produit'}
                    alt={fav.title}
                    onError={e => { e.target.src = 'https://placehold.co/400x300?text=Produit' }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

                {/* Bouton retirer des favoris */}
                <button
                    onClick={() => handleRemove(fav.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-50
                    text-red-400 hover:text-red-500 rounded-full flex items-center justify-center
                    shadow-sm transition-colors"
                >
                    ❤️
                </button>

                {/* Bouton ajouter au panier */}
                {(fav.quantity ?? 1) > 0 && (
                    <button
                    onClick={() => handleAddToCart(fav.id)}
                    className="absolute bottom-0 left-0 right-0 bg-amber-400 hover:bg-amber-500
                        text-white font-semibold text-sm py-3
                        translate-y-full group-hover:translate-y-0
                        transition-transform duration-300"
                    >
                    🛒 Ajouter au panier
                    </button>
                )}
                </div>

                {/* Infos */}
                <div className="p-4">
                <p className="text-xs text-amber-500 font-medium uppercase tracking-wide mb-1">
                    {fav.category?.name ?? 'Divers'}
                </p>
                <Link
                    to={`/products/${fav.id}`}
                    className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 hover:text-amber-600 transition-colors block mb-2"
                >
                    {fav.title}
                </Link>
                <span className="font-bold text-gray-900">
                    {Number(fav.effective_price ?? fav.price).toLocaleString('fr-FR')} FCFA
                </span>
                </div>

            </div>
            ))}
        </div>
      )}
    </Layout>
  )
}