import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { createOrder } from '../../services/orders'
import { Layout } from '../../components/layout/Layout'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  // Champs du formulaire
  const [form, setForm] = useState({
    shipping_address:     '',
    shipping_city:        '',
    shipping_postal_code: '',
    shipping_phone:       '',
    notes:                '',
    coupon_code:          '',
  })

  // Erreurs de validation
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // On efface l'erreur du champ dès que l'utilisateur tape
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // Validation côté client avant d'envoyer à l'API
  function validate() {
    const newErrors = {}
    if (!form.shipping_address.trim())
      newErrors.shipping_address = 'L\'adresse est obligatoire'
    if (!form.shipping_city.trim())
      newErrors.shipping_city = 'La ville est obligatoire'
    if (!form.shipping_postal_code.trim())
      newErrors.shipping_postal_code = 'Le code postal est obligatoire'
    if (!form.shipping_phone.trim())
      newErrors.shipping_phone = 'Le téléphone est obligatoire'
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // 1. Validation
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // 2. Appel API
    try {
      setLoading(true)
      const payload = {
        shipping_address:     form.shipping_address,
        shipping_city:        form.shipping_city,
        shipping_postal_code: form.shipping_postal_code,
        shipping_phone:       form.shipping_phone,
        notes:                form.notes || undefined,
        coupon_code:          form.coupon_code || undefined,
      }
      const { data } = await createOrder(payload)

      // 3. Succès — on vide le panier et on redirige
      await clearCart()
      toast.success('Commande passée avec succès !')
      navigate(`/orders/${data.data?.id ?? data.id}`)
    } catch (err) {
      const message = err.response?.data?.message ?? 'Erreur lors de la commande'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Champ réutilisable pour éviter la répétition
  function Field({ label, name, type = 'text', placeholder, required }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors
            ${errors[name]
              ? 'border-red-300 focus:border-red-400'
              : 'border-gray-200 focus:border-amber-400'
            }`}
        />
        {errors[name] && (
          <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
        )}
      </div>
    )
  }

  return (
    <Layout>
      

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finaliser la commande</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">

          {/* Livraison */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Adresse de livraison</h2>
            <div className="flex flex-col gap-4">
              <Field
                label="Adresse"
                name="shipping_address"
                placeholder="Ex: 12 Rue Félix Faure"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Ville"
                  name="shipping_city"
                  placeholder="Ex: Dakar"
                  required
                />
                <Field
                  label="Code postal"
                  name="shipping_postal_code"
                  placeholder="Ex: 10000"
                  required
                />
              </div>
              <Field
                label="Téléphone"
                name="shipping_phone"
                type="tel"
                placeholder="Ex: +221 77 000 00 00"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Informations supplémentaires</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes pour le vendeur
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Instructions spéciales, informations de livraison..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Code promo</h2>
            <div className="flex gap-2">
              <input
                type="text"
                name="coupon_code"
                value={form.coupon_code}
                onChange={handleChange}
                placeholder="Entrez votre code promo"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:border-amber-400 transition-colors uppercase"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              La réduction sera appliquée au moment de la confirmation.
            </p>
          </div>

          {/* Bouton submit visible sur mobile */}
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="lg:hidden w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold
              py-3 rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? 'Traitement...' : 'Confirmer la commande'}
          </button>
        </form>

        {/* ── Résumé ── */}
        <div className="lg:w-72 flex-none">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Résumé</h2>

            {/* Liste des articles */}
            <div className="flex flex-col gap-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.product?.title}
                    <span className="text-gray-400"> x{item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-800 flex-none">
                    {Number(item.subtotal).toLocaleString('fr-FR')} FCFA
                  </span>
                                    </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-amber-500">
                  {Number(total).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Bouton submit desktop */}
            <button
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className="hidden lg:block w-full bg-amber-400 hover:bg-amber-500 text-white
                font-semibold py-3 rounded-xl transition-colors disabled:opacity-70"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>

            {items.length === 0 && (
              <p className="text-xs text-center text-red-400 mt-2">
                Votre panier est vide
              </p>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}