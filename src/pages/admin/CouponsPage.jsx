import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import client from '../../api/client'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await client.get('/admin/coupons')
      setCoupons(res.data?.data || res.data || [])
    } catch (err) {
      toast.error('Impossible de charger les coupons.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await client.post('/admin/coupons', formData)
      setCoupons([...coupons, res.data])
      toast.success('Coupon créé !')
      setShowForm(false)
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création.')
    }
  }

  const handleDelete = async (id, code) => {
    if (!confirm(`Supprimer le coupon "${code}" ?`)) return
    try {
      await client.delete(`/admin/coupons/${id}`)
      setCoupons(coupons.filter(c => c.id !== id))
      toast.success(`Coupon "${code}" supprimé !`)
    } catch (err) {
      toast.error('Erreur lors de la suppression.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-400 mt-1">Gérez les codes promo de la marketplace.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            {showForm ? 'Annuler' : '+ Nouveau coupon'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Formulaire création */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Créer un coupon</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Code *</label>
                <input
                  type="text" name="code" value={formData.code} onChange={handleChange}
                  placeholder="Ex: PROMO20"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de réduction *</label>
                <select
                  name="discount_type" value={formData.discount_type} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valeur *</label>
                <input
                  type="number" name="discount_value" value={formData.discount_value} onChange={handleChange}
                  placeholder="Ex: 20"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Montant minimum</label>
                <input
                  type="number" name="min_order_amount" value={formData.min_order_amount} onChange={handleChange}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre max d'utilisations</label>
                <input
                  type="number" name="max_uses" value={formData.max_uses} onChange={handleChange}
                  placeholder="Ex: 100"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'expiration</label>
                <input
                  type="date" name="expires_at" value={formData.expires_at} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Créer le coupon
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste coupons */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <span className="text-5xl block mb-4">🎟️</span>
            <p className="text-gray-500">Aucun coupon créé pour le moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Code</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Réduction</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Utilisations</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Expiration</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg text-sm">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `${parseFloat(coupon.discount_value).toLocaleString()} FCFA`
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {coupon.used_count || 0} / {coupon.max_uses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}