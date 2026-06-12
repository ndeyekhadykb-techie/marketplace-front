import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../../api/client'

export default function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams() // si id existe → mode édition, sinon → mode création
  
console.log('ID récupéré:', id)
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [productImage, setProductImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: 1,
    category_id: ''
  })

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/categories')
        setCategories(res.data?.data || res.data || [])
      } catch (err) {
        console.error('Erreur catégories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Si mode édition → charger les données du produit
  useEffect(() => {
    if (!isEditing) return
    const fetchProduct = async () => {
      try {
        const res = await client.get(`/products/${id}`)
        const p = res.data?.data || res.data
        setFormData({
          title: p.title || '',
          description: p.description || '',
          price: p.price || '',
          quantity: p.quantity || 1,
          category_id: p.category_id || ''
        })
        if (p.image) setPreview(p.image)
      } catch (err) {
  console.error('Status:', err.response?.status)
  console.error('Data:', err.response?.data)
  setError('Impossible de charger le produit.')
} finally {
        setFetching(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isEditing && !productImage) {
      setError('Veuillez sélectionner une image pour votre produit.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('quantity', formData.quantity)
      data.append('category_id', formData.category_id)
      if (productImage) data.append('image', productImage)
      if (isEditing) data.append('_method', 'PUT') // Laravel nécessite ça pour PUT avec FormData

      await client.post(
        isEditing ? `/products/${id}` : '/products',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      alert(` Produit "${formData.title}" ${isEditing ? 'modifié' : 'ajouté'} avec succès !`)
      navigate('/seller/products')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Chargement du produit...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing ? 'Modifiez les informations de votre produit.' : 'Remplissez les informations pour le mettre en ligne.'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">

        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-medium border border-red-100">
             {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Ex: Samsung Galaxy A55"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image du produit *</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Aperçu" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setProductImage(null) }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold"
                  >✕</button>
                </div>
              ) : (
                <input
                  type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-500 hover:file:bg-red-100 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              rows="4" placeholder="Décrivez votre produit..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors resize-none"
              required
            />
          </div>

          {/* Prix & Quantité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (FCFA) *</label>
              <input
                type="number" name="price" value={formData.price} onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité *</label>
              <input
                type="number" name="quantity" value={formData.quantity} onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
            <select
              name="category_id" value={formData.category_id} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Boutons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button" onClick={() => navigate('/seller/products')}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit" onClick={handleSubmit} disabled={loading}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Publier le produit'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}