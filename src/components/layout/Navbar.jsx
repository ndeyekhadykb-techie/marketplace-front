import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { FiSearch } from 'react-icons/fi'
import { search as searchAPI } from '../../services/products'

// ─── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ user, size = 'w-8 h-8' }) {
  const [imgError, setImgError] = useState(false)
  const src = user.profile_image?.replace('http://localhost/', 'http://localhost:8000/')

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={user.name}
        onError={() => setImgError(true)}
        className={`${size} rounded-full object-cover`}
      />
    )
  }

  return (
    <div className={`${size} bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm`}>
      {user.name?.[0]?.toUpperCase()}
    </div>
  )
}

// ─── SearchBar ──────────────────────────────────────────────────────────────
function SearchBar() {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)
  const requestId = useRef(0)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults(null)
      setOpen(false)
      return
    }

    setOpen(true)
    debounceRef.current = setTimeout(async () => {
      const currentId = ++requestId.current
      try {
        setLoading(true)
        const { data } = await searchAPI(value.trim(), 'all')
        if (currentId === requestId.current) setResults(data)
      } catch {
        if (currentId === requestId.current) setResults(null)
      } finally {
        if (currentId === requestId.current) setLoading(false)
      }
    }, 300)
  }

  function goToResults() {
    if (!query.trim()) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    goToResults()
  }

  const hasResults = results && (
    results.products?.length > 0 ||
    results.sellers?.length > 0 ||
    results.categories?.length > 0
  )

  return (
    <div ref={wrapperRef} className="relative hidden md:block w-72">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder="Rechercher..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm
              focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </form>

      {open && query.trim() && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-sm text-gray-400 text-center">Recherche...</div>
          ) : !hasResults ? (
            <div className="p-4 text-sm text-gray-400 text-center">Aucun résultat.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results.categories?.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Catégories</p>
                  {results.categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-2 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {results.products?.length > 0 && (
                <div className="p-2 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Produits</p>
                  {results.products.map(p => (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <img
                        src={p.image || 'https://placehold.co/40x40?text=•'}
                        alt={p.title}
                        onError={e => { e.target.src = 'https://placehold.co/40x40?text=•' }}
                        className="w-10 h-10 rounded-lg object-cover flex-none"
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{p.title}</p>
                        <p className="text-xs text-amber-500 font-medium">
                          {Number(p.price).toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.sellers?.length > 0 && (
                <div className="p-2 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Vendeurs</p>
                  {results.sellers.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-2 py-2">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xs flex-none">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={goToResults}
                className="w-full text-center text-sm text-amber-500 hover:text-amber-600 font-medium py-3 border-t border-gray-100"
              >
                Voir tous les résultats →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const isSeller = user?.role === 'seller'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo + liens du milieu */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-1 flex-none">
            <span className="text-xl font-bold text-gray-900">EPF</span>
            <span className="text-xl font-bold text-amber-400">Market</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {/* Produits/Catégories : uniquement pour les non-vendeurs (buyer, admin) */}
            {!isSeller && (
              <>
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
                >
                  Produits
                </Link>
                <Link
                  to="/categories"
                  className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
                >
                  Catégories
                </Link>
              </>
            )}

            {/* Lien visible uniquement pour le vendeur */}
            {isSeller && (
              <Link
                to="/seller/dashboard"
                className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
              >
                Mon espace
              </Link>
            )}

            {/* Lien visible uniquement pour l'admin */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        {user && <SearchBar />}

        {/* Actions à droite */}
        <div className="flex items-center gap-3 flex-none">
          {user ? (
            <>
              {/* Icône panier — visible uniquement pour l'acheteur */}
              {user.role === 'buyer' && (
                <>
                  <Link
                    to="/favorites"
                    className="p-2 text-gray-600 hover:text-amber-500 transition-colors"
                  >
                    ❤️
                  </Link>
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors"
                  >
                    🛒
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {/* Avatar — photo de profil si elle existe, sinon initiale */}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-amber-500 transition-colors"
              >
                <Avatar user={user} />
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-amber-500 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}