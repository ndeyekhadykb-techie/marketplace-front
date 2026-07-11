import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../services/products'
import { PageLoader } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Layout } from '../components/layout/Layout'

// Mêmes visuels que le carousel "Recherches rapides" de la HomePage
function getCategoryImage(name) {
  const images = {
    'Électronique': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
    'Loisirs':      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80',
    'Maison':       'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    'Mode':         'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
    'Alimentation': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    'Sport':        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
    'Beauté':       'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
    'Livres':       'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80',
    'Jouets':       'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80',
    'Informatique': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    'Téléphonie':   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'Automobile':   'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
  }
  return images[name] ?? `https://placehold.co/400x300?text=${encodeURIComponent(name)}`
}

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadCategories() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getCategories()
      setCategories(data.data ?? data)
    } catch {
      setError('Impossible de charger les catégories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <ErrorMessage message={error} retry={loadCategories} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/products?category=${cat.id}`)}
            className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-32 overflow-hidden">
              <img
                src={cat.icon ?? getCategoryImage(cat.name)}
                alt={cat.name}
                onError={e => { e.target.src = `https://placehold.co/400x300?text=${encodeURIComponent(cat.name)}` }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                {cat.name}
              </p>
              {cat.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </Layout>
  )
}