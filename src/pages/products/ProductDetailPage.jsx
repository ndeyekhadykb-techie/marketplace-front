import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct } from '../../services/products'
import { addFavorite, removeFavorite } from '../../services/favorites'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/ui/Spinner'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Layout } from '../../components/layout/Layout'

// ─── Composant étoiles ────────────────────────────────────────────────────────
function Stars({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-lg ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ─── Formulaire avis ──────────────────────────────────────────────────────────
function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      // Import dynamique pour éviter les imports circulaires
      const { default: client } = await import('../../api/client')
      await client.post(`/products/${productId}/reviews`, { rating, comment })
      toast.success('Avis publié !')
      setComment('')
      setRating(5)
      onReviewAdded()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la publication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
      <h3 className="font-semibold text-gray-800 text-sm">Laisser un avis</h3>

      {/* Sélection étoiles */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Partagez votre expérience..."
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
          focus:outline-none focus:border-amber-400 transition-colors resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="self-end bg-amber-400 hover:bg-amber-500 text-white px-5 py-2
          rounded-xl text-sm font-semibold transition-colors disabled:opacity-70"
      >
        {loading ? 'Publication...' : 'Publier'}
      </button>
    </form>
  )
}

// ─── ProductDetailPage ────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(null)

  async function loadProduct() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getProduct(id)
      const p = data.data ?? data
      setProduct(p)
      setActiveImage(p.image)
      setIsFav(p.is_favorite ?? false)
    } catch {
      setError('Impossible de charger ce produit.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  async function handleAddToCart() {
    if (!user) return toast('Connectez-vous pour ajouter au panier')
    if (user.role !== 'buyer') return toast('Seuls les acheteurs peuvent acheter')
    try {
      setAdding(true)
      await addItem(product.id, quantity)
      toast.success('Ajouté au panier !')
    } catch {
      toast.error("Erreur lors de l'ajout")
    } finally {
      setAdding(false)
    }
  }

  async function handleToggleFav() {
    if (!user) return toast('Connectez-vous pour ajouter aux favoris')
    try {
      if (isFav) {
        await removeFavorite(product.id)
        toast.success('Retiré des favoris')
      } else {
        await addFavorite(product.id)
        toast.success('Ajouté aux favoris !')
      }
      setIsFav(prev => !prev)
    } catch {
      toast.error('Erreur')
    }
  }

  async function handleContactSeller() {
    navigate(`/messages?with=${product.seller?.id}`)
  }

  if (loading) return <Layout><PageLoader /></Layout>
  if (error)   return <Layout><ErrorMessage message={error} retry={loadProduct} /></Layout>
  if (!product) return null

  const images = product.images
    ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images)
    : []

  const allImages = [product.image, ...images].filter(Boolean)

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate('/products')} className="hover:text-amber-500 transition-colors">
          Produits
        </button>
        <span>›</span>
        <span className="text-gray-600 truncate">{product.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Images ── */}
        <div className="lg:w-1/2 flex flex-col gap-3">
          {/* Image principale */}
          <div className="rounded-2xl overflow-hidden bg-gray-50 h-80">
            <img
              src={(activeImage ?? '').replace('http://localhost/', 'http://localhost:8000/') || 'https://placehold.co/600x400?text=Produit'}
              alt={product.title}
              onError={e => { e.target.src = 'https://placehold.co/600x400?text=Produit' }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Miniatures */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`flex-none w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors
                    ${activeImage === img ? 'border-amber-400' : 'border-transparent'}`}
                >
                  <img
                    src={img.replace('http://localhost/', 'http://localhost:8000/')}
                    alt={`${product.title} ${i + 1}`}
                    onError={e => { e.target.src = 'https://placehold.co/64x64?text=P' }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Infos produit ── */}
        <div className="lg:w-1/2 flex flex-col gap-5">

          {/* Catégorie + titre */}
          <div>
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1">
              {product.category?.name ?? 'Divers'}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={product.rating} />
              <span className="text-sm text-gray-500">
                {Number(product.rating).toFixed(1)} ({product.total_reviews} avis)
              </span>
            </div>
          )}

          {/* Prix */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {Number(product.effective_price ?? product.price).toLocaleString('fr-FR')} FCFA
            </span>
            {product.is_on_sale && (
              <span className="text-lg text-gray-400 line-through">
                {Number(product.price).toLocaleString('fr-FR')} FCFA
              </span>
            )}
            {product.is_on_sale && (
              <span className="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                Promo
              </span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium ${product.quantity > 0 ? 'text-green-500' : 'text-red-400'}`}>
            {product.quantity > 0 ? `${product.quantity} en stock` : 'Rupture de stock'}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantité + actions */}
          {user?.role === 'buyer' && product.quantity > 0 && (
            <div className="flex items-center gap-3">
              {/* Sélecteur quantité */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Bouton panier */}
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-semibold
                  py-3 rounded-xl transition-colors disabled:opacity-70"
              >
                {adding ? 'Ajout...' : '🛒 Ajouter au panier'}
              </button>

              {/* Bouton favori */}
              <button
                onClick={handleToggleFav}
                className="w-12 h-12 border border-gray-200 rounded-xl flex items-center
                  justify-center hover:border-amber-400 transition-colors text-lg"
              >
                {isFav ? '❤️' : '🤍'}
              </button>
            </div>
          )}

          {/* Contacter le vendeur */}
          {user && user.role === 'buyer' && product.seller && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
                    {product.seller.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{product.seller.name}</p>
                    <p className="text-xs text-gray-400">Vendeur</p>
                  </div>
                </div>
                <button
                  onClick={handleContactSeller}
                  className="text-sm text-amber-500 hover:text-amber-600 font-medium transition-colors border border-amber-200 hover:border-amber-400 px-4 py-2 rounded-xl"
                >
                  Contacter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Avis ── */}
      <div className="mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Avis clients</h2>
          <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
        </div>

        {/* Formulaire avis — seulement pour les buyers */}
        {user?.role === 'buyer' && (
          <div className="mb-6">
            <ReviewForm productId={id} onReviewAdded={loadProduct} />
          </div>
        )}

        {/* Liste des avis */}
        {product.reviews?.length === 0 || !product.reviews ? (
          <p className="text-gray-400 text-sm">Aucun avis pour ce produit.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {product.reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {review.buyer?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">
                      {review.buyer?.name}
                    </span>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}