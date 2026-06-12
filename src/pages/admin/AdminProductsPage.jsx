import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import client from '../../api/client'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await client.get('/products')
        setProducts(res.data?.data || res.data || [])
      } catch (err) {
        console.error('Erreur produits:', err)
        toast.error('Impossible de charger les produits.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleUpdateStatus = async (id, status) => {
    try {
      await client.patch(`/admin/products/${id}/status`, { status })
      setProducts(products.map(p => p.id === id ? { ...p, status } : p))
      toast.success('Statut mis à jour !')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Supprimer définitivement "${title}" ?`)) return
    try {
      await client.delete(`/admin/products/${id}/force`)
      setProducts(products.filter(p => p.id !== id))
      toast.success(`"${title}" supprimé !`)
    } catch (err) {
      toast.error('Erreur lors de la suppression.')
    }
  }

  const statusConfig = {
    published: { label: 'Publié', classes: 'bg-green-50 text-green-600' },
    draft: { label: 'Brouillon', classes: 'bg-gray-100 text-gray-500' },
    sold: { label: 'Vendu', classes: 'bg-blue-50 text-blue-600' },
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Modération produits</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez et modérez les produits de la marketplace.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-gray-500">Aucun produit trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => {
              const status = statusConfig[product.status] || statusConfig.draft
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">

                  {/* Image */}
                  <div className="h-40 bg-gray-50 rounded-t-2xl overflow-hidden border-b border-gray-100 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📱</span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Vendeur : {product.seller?.name || 'Inconnu'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${status.classes}`}>
                        {status.label}
                      </span>
                      <p className="text-base font-black text-gray-900">
                        {parseFloat(product.price || 0).toLocaleString()} FCFA
                      </p>
                    </div>

                    {/* Actions statut */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(product.id, 'published')}
                        className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        ✅ Publier
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(product.id, 'draft')}
                        className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        📝 Brouillon
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors"
                    >
                      🗑️ Supprimer définitivement
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}