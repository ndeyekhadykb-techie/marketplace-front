import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { search } from '../services/products'
import { PageLoader } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Layout } from '../components/layout/Layout'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadResults() {
    if (!q.trim()) {
      setResults(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data } = await search(q, 'all')
      setResults(data)
    } catch {
      setError("Impossible d'effectuer la recherche.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const hasResults = results && (
    results.products?.length > 0 ||
    results.sellers?.length > 0 ||
    results.categories?.length > 0
  )

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Résultats pour « {q} »
        </h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <ErrorMessage message={error} retry={loadResults} />

      {!hasResults && !error && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p>Aucun résultat pour cette recherche.</p>
        </div>
      )}

      {/* Catégories */}
      {results?.categories?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Catégories</h2>
          <div className="flex flex-wrap gap-3">
            {results.categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="bg-white px-5 py-3 rounded-xl shadow-sm hover:shadow-md text-sm font-medium text-gray-700 hover:text-amber-500 transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits */}
      {results?.products?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Produits</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.products.map(p => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gray-100">
                  <img
                    src={p.image || 'https://placehold.co/300x200?text=Produit'}
                    alt={p.title}
                    onError={e => { e.target.src = 'https://placehold.co/300x200?text=Produit' }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-800 line-clamp-2 mb-1">{p.title}</p>
                  <p className="text-sm font-bold text-amber-500">
                    {Number(p.price).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Vendeurs */}
      {results?.sellers?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vendeurs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.sellers.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                {s.profile_image ? (
                  <img
                    src={s.profile_image}
                    alt={s.name}
                    className="w-12 h-12 rounded-full object-cover flex-none"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold flex-none">
                    {s.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">⭐ {Number(s.rating ?? 0).toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  )
}