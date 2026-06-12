import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import client from '../../api/client'

export default function MyProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await client.get('/products/my-products')
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        console.log('Premier produit:', data[0])
        setProducts(data)
      } catch (err) {
        console.error('Erreur:', err)
        toast.error('Impossible de charger votre catalogue.')
      } finally {
        setLoading(false)
      }
    }
    fetchMyProducts()
  }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Supprimer définitivement "${title}" ?`)) return
    try {
      await client.delete(`/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      toast.success(`"${title}" supprimé !`)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la suppression.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Catalogue</h1>
            <p className="text-sm text-gray-400 mt-1">Gérez vos articles et suivez vos stocks.</p>
          </div>
          <Link
            to="/seller/products/new"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            + Nouveau produit
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            Chargement de vos produits...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <p className="font-medium text-gray-500">Aucun produit en vente pour le moment.</p>
            <Link
              to="/seller/products/new"
              className="inline-block mt-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              + Ajouter votre premier produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image */}
                <div className="h-44 bg-gray-50 rounded-t-2xl overflow-hidden border-b border-gray-100 flex items-center justify-center">
                  {product.image ? (
                    <img
                     src={product.image?.replace('http://localhost/', 'http://localhost:8000/')}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📱</span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-600 rounded-lg">
                      Stock : {product.quantity}
                    </span>
                    <p className="text-base font-black text-gray-900">
                      {parseFloat(product.price || 0).toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <Link
                      to={`/seller/products/${product.id}/edit`}
                      className="text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors border border-gray-100"
                    >
                      ✏️ Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      className="py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}