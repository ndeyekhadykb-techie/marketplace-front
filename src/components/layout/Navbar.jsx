import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-gray-900">EPF</span>
          <span className="text-xl font-bold text-amber-400">Market</span>
        </Link>

        {/* Liens du milieu */}
        <div className="hidden md:flex items-center gap-6">
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

          {/* Lien visible uniquement pour le vendeur */}
          {user?.role === 'seller' && (
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

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Icône panier — visible uniquement pour l'acheteur */}
              {user.role === 'buyer' && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors"
                >
                  🛒
                  {/* Badge avec le nombre d'articles */}
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Avatar avec la première lettre du nom */}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-amber-500 transition-colors"
              >
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
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