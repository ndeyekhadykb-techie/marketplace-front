import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories } from '../../services/products'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/Spinner'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Layout } from '../../components/layout/Layout'

// ─── ProductCard ──────────────────────────────────────────────────────────────
// On réutilise le même style que HomePage
function ProductCard({ product }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)

  async function handleAddToCart(e) {
    e.preventDefault()
    if (!user) return toast('Connectez-vous pour ajouter au panier', 'warning')
    if (user.role !== 'buyer') return toast('Seuls les acheteurs peuvent acheter', 'info')
    try {
      setAdding(true)
      await addItem(product.id)
      toast.success('Ajouté au panier !')
    } catch {
      toast.error("Erreur lors de l'ajout")
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      
      <Link to={`/products/${product.id}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
          <div className="relative overflow-hidden h-48">
            <img
              src={product.image ?? 'https://placehold.co/400x300?text=Produit'}
              alt={product.title}
              onError={e => { e.target.src = 'https://placehold.co/400x300?text=Produit' }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

            {product.is_on_sale && (
              <span className="absolute top-3 left-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                Promo
              </span>
            )}

            {/* undefined ?? 1 signifie : si quantity n'existe pas, on suppose qu'il y en a */}
            {user?.role === 'buyer' && (product.quantity ?? 1) > 0 && (
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

// ─── ProductsPage ─────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On lit les filtres depuis l'URL
  // Comme ça si l'utilisateur partage le lien, les filtres sont conservés
  const currentCategory = searchParams.get('category') ?? ''
  const currentSort     = searchParams.get('sort') ?? ''
  const currentMin      = searchParams.get('min_price') ?? ''
  const currentMax      = searchParams.get('max_price') ?? ''
  const currentPage     = parseInt(searchParams.get('page') ?? '1')

  async function loadProducts() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getProducts({
        page:        currentPage,
        per_page:    12,
        category_id: currentCategory || undefined,
        sort:        currentSort     || undefined,
        min_price:   currentMin      || undefined,
        max_price:   currentMax      || undefined,
        status:      'published',
      })
      setProducts(data.data ?? data)
      setPagination(data.pagination ?? null)
    } catch {
      setError('Impossible de charger les produits.')
    } finally {
      setLoading(false)
    }
  }

  // Charge les catégories une seule fois
  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.data ?? res.data))
      .catch(() => {})
  }, [])

  // Recharge les produits à chaque changement de filtre
  useEffect(() => {
    loadProducts()
  }, [searchParams])

  // Met à jour un filtre dans l'URL et remet la page à 1
  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete('page') // reset pagination
    setSearchParams(next)
  }

  function goToPage(page) {
    const next = new URLSearchParams(searchParams)
    next.set('page', page)
    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams({})
  }

  const hasFilters = currentCategory || currentSort || currentMin || currentMax

  return (
    <Layout>
      <div className="flex gap-8">

        {/* ── Sidebar filtres ── */}
        <aside className="hidden lg:block w-56 flex-none">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Filtres</h2>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-amber-500 hover:text-amber-600"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Catégories */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Catégorie
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition-colors
                    ${!currentCategory
                      ? 'bg-amber-50 text-amber-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Toutes
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.id)}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors
                      ${currentCategory === String(cat.id)
                        ? 'bg-amber-50 text-amber-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Prix (FCFA)
              </h3>
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={currentMin}
                  onChange={e => updateFilter('min_price', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={currentMax}
                  onChange={e => updateFilter('max_price', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Tri */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Trier par
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Plus récent',       value: 'latest' },
                  { label: 'Prix croissant',    value: 'price_asc' },
                  { label: 'Prix décroissant',  value: 'price_desc' },
                  { label: 'Mieux notés',       value: 'rating' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('sort', option.value)}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors
                      ${currentSort === option.value
                        ? 'bg-amber-50 text-amber-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Contenu principal ── */}
        <div className="flex-1">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tous les produits</h1>
              <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
            </div>
            {pagination && (
              <span className="text-sm text-gray-400">
                {pagination.total} produit{pagination.total > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <ErrorMessage message={error} retry={loadProducts} />

          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">📦</p>
              <p>Aucun produit trouvé.</p>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm text-amber-500 hover:text-amber-600 underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-full border border-gray-200 hover:border-amber-400
                      hover:text-amber-500 flex items-center justify-center transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>

                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors
                        ${page === currentPage
                          ? 'bg-amber-400 text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="w-9 h-9 rounded-full border border-gray-200 hover:border-amber-400
                      hover:text-amber-500 flex items-center justify-center transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}