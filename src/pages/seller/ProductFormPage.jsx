import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../../api/client'
import { FiTrash2 } from 'react-icons/fi'
import { Layout } from '../../components/layout/Layout'

export default function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams() // si id existe → mode édition, sinon → mode création

  // true en mode édition (URL du type /seller/products/12/edit), false en mode création
  const isEditing = !!id

  const [loading, setLoading] = useState(false)       // true pendant l'envoi du formulaire
  const [fetching, setFetching] = useState(isEditing)  // true pendant le chargement du produit à éditer
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [productImage, setProductImage] = useState(null) // fichier image sélectionné (objet File)
  const [preview, setPreview] = useState(null)            // URL d'aperçu de l'image (locale ou distante)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: 1,
    category_id: ''
  })

  // Charge la liste des catégories pour le menu déroulant, une seule fois au montage
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

  // En mode édition, précharge les données existantes du produit dans le formulaire
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
        // Affiche l'image déjà en ligne comme aperçu tant qu'aucune nouvelle image n'est choisie
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

  // Met à jour un champ texte/select du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Stocke le fichier image choisi et génère un aperçu local instantané (sans upload)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // En création, l'image est obligatoire ; en édition, on peut garder l'image existante
    if (!isEditing && !productImage) {
      setError('Veuillez sélectionner une image pour votre produit.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      // FormData obligatoire ici car on envoie potentiellement un fichier binaire (image),
      // impossible avec un simple JSON.
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('quantity', formData.quantity)
      data.append('category_id', formData.category_id)
      data.append('status', 'published')
      if (productImage) data.append('image', productImage) // n'envoie l'image que si une nouvelle a été choisie
      if (isEditing) data.append('_method', 'PUT') // Laravel nécessite ça pour PUT avec FormData (method spoofing)

      // Toujours un POST côté HTTP : le _method=PUT ci-dessus fait la bascule côté Laravel
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

  // Écran de chargement pendant la récupération du produit existant (mode édition)
  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center text-gray-400 py-16">
          Chargement du produit...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>

      {/* Header : titre dynamique selon création/édition */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? 'Modifiez les informations de votre produit.' : 'Remplissez les informations pour le mettre en ligne.'}
        </p>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* Message d'erreur global (validation ou erreur serveur) */}
        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-medium border border-red-100">
             {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Ex: Samsung Galaxy A55"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Image : zone d'upload ou aperçu avec bouton de suppression */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image du produit *</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Aperçu" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setProductImage(null) }}
                    className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl p-2 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <FiTrash2 size={16} />
                  </button>
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

          {/* Prix & Quantité, côte à côte */}
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

          {/* Catégorie, remplie dynamiquement depuis l'API */}
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

          {/* Boutons Annuler / Enregistrer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button" onClick={() => navigate('/seller/products')}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit" onClick={handleSubmit} disabled={loading}
              style={{ backgroundColor: '#F5A623' }}
              className="px-5 py-2.5 disabled:bg-gray-300 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm hover:opacity-90"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Publier le produit'}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  )
}