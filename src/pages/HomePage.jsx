import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts, getCategories } from '../services/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { PageLoader } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Layout } from '../components/layout/Layout'

// ─── HeroBanner ───────────────────────────────────────────────────────────────
function HeroBanner() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden mb-12 min-h-[320px] flex items-center">
      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-20 w-40 h-40 bg-amber-400/5 rounded-full translate-y-1/2" />

      <div className="relative z-10 px-10 py-14 max-w-xl">
        <span className="inline-block text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
          EPF Marketplace
        </span>
        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
          Achetez et vendez<br />
          <span className="text-amber-400">en toute confiance</span>
        </h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Des milliers de produits à portée de main. Vendeurs vérifiés, paiement sécurisé.
        </p>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une catégorie..."
            className="flex-1 bg-white/10 text-white placeholder-gray-400 border border-white/20
              rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Chercher
          </button>
        </form>
      </div>
    </section>
  )
}

// ─── CategoryCarousel ─────────────────────────────────────────────────────────
function CategoryCarousel({ categories }) {
  const scrollRef = useRef(null)
  const navigate = useNavigate()

  function scroll(direction) {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: direction * 280, behavior: 'smooth' })
  }

  if (!categories.length) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recherches rapides</h2>
          <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
        </div>
        {/* Flèches navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full border border-gray-200 hover:border-amber-400
              hover:text-amber-500 flex items-center justify-center transition-colors text-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full border border-gray-200 hover:border-amber-400
              hover:text-amber-500 flex items-center justify-center transition-colors text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Liste scrollable horizontalement */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/products?category=${cat.id}`)}
            className="flex-none w-44 group text-center"
          >
            <div className="w-44 h-32 rounded-xl overflow-hidden mb-2 shadow-sm">
            <img
                src={cat.icon ?? `https://placehold.co/176x128?text=${encodeURIComponent(cat.name)}`}
                alt={cat.name}
                onError={e => { e.target.src = `https://placehold.co/176x128?text=${encodeURIComponent(cat.name)}` }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            </div>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product }) {
    const { addItem } = useCart()
    const { user } = useAuth()
    const { toast, ToastContainer } = useToast()
    const [adding, setAdding] = useState(false)
  
    async function handleAddToCart(e) {
      e.preventDefault()
      if (!user) return toast('Connectez-vous pour ajouter au panier', 'warning')
      if (user.role !== 'buyer') return toast('Seuls les acheteurs peuvent acheter', 'info')
      try {
        setAdding(true)
        await addItem(product.id)
        toast('Ajouté au panier !', 'success')
      } catch {
        toast("Erreur lors de l'ajout", 'error')
      } finally {
        setAdding(false)
      }
    }
  
    return (
      <>
        <ToastContainer />
        <Link to={`/products/${product.id}`} className="group block">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
  
            {/* Image */}
            <div className="relative overflow-hidden h-52">
              <img
                src={product.image ?? 'https://placehold.co/400x300?text=Produit'}
                alt={product.title}
                onError={e => { e.target.src = 'https://placehold.co/400x300?text=Produit' }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
  
              {/* Badge promo — l'API nous dit directement si c'est en promo */}
              {product.is_on_sale && (
                <span className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Promo
                </span>
              )}
  
              {/* Bouton panier */}
              {user?.role === 'buyer' && product.quantity > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="absolute bottom-0 left-0 right-0 bg-amber-400 hover:bg-amber-500
                    text-white font-semibold text-sm py-3
                    translate-y-full group-hover:translate-y-0
                    transition-transform duration-300 disabled:opacity-70"
                >
                  {adding ? 'Ajout...' : '🛒 Ajouter au panier'}
                </button>
              )}
  
              {product.quantity === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gray-500/80 text-white text-sm text-center py-3">
                  Rupture de stock
                </div>
              )}
            </div>
  
            {/* Infos */}
            <div className="p-4">
              <p className="text-xs text-amber-500 font-medium uppercase tracking-wide mb-1">
                {product.category?.name ?? 'Divers'}
              </p>
              <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                {product.title}
              </h3>
  
              {product.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs text-gray-500">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({product.total_reviews})</span>
                </div>
              )}
  
              {/* Prix — on utilise effective_price directement */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {Number(product.effective_price).toLocaleString('fr-FR')} FCFA
                </span>
                {product.is_on_sale && (
                  <span className="text-xs text-gray-400 line-through">
                    {Number(product.price).toLocaleString('fr-FR')} FCFA
                  </span>
                )}
              </div>
            </div>
  
          </div>
        </Link>
      </>
    )
  }

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      // On lance les deux appels en parallèle pour aller plus vite
      const [prodRes, catRes] = await Promise.all([
        getProducts({ per_page: 12, status: 'published' }),
        getCategories(),
      ])
      setProducts(prodRes.data.data ?? prodRes.data)
      setCategories(catRes.data.data ?? catRes.data)
    } catch {
      setError('Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <HeroBanner />

      <ErrorMessage message={error} retry={loadData} />

      <CategoryCarousel categories={categories} />

      {/* Grille produits */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tous les produits</h2>
            <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
          </div>
          <Link
            to="/products"
            className="text-sm text-amber-500 hover:text-amber-600 font-medium transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📦</p>
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}