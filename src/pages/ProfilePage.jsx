import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getMe, updateProfile } from '../services/profile'
import { PageLoader } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Layout } from '../components/layout/Layout'

// ─── Champs définis en dehors du composant pour éviter le bug de focus ────────
function Field({ label, name, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors
          ${error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'}`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function TextArea({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
      />
    </div>
  )
}

const ROLE_LABELS = { buyer: 'Acheteur', seller: 'Vendeur', admin: 'Admin' }

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', phone: '', city: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imgBroken, setImgBroken] = useState(false)

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getMe()
      setProfile(data.user)
      setForm({
        name: data.user.name ?? '',
        bio: data.user.bio ?? '',
        phone: data.user.phone ?? '',
        city: data.user.city ?? '',
      })
    } catch {
      setError('Impossible de charger votre profil.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImgBroken(false)
  }

  function cancelEdit() {
    setEditing(false)
    setImageFile(null)
    setImagePreview(null)
    setForm({
      name: profile.name ?? '',
      bio: profile.bio ?? '',
      phone: profile.phone ?? '',
      city: profile.city ?? '',
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Le nom est obligatoire.')
      return
    }

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('bio', form.bio ?? '')
      formData.append('phone', form.phone ?? '')
      formData.append('city', form.city ?? '')
      if (imageFile) formData.append('profile_image', imageFile)

      const { data } = await updateProfile(formData)
      setProfile(data.user)
      // On resynchronise le user global (navbar, etc.) sans re-login
      updateUser({ ...authUser, ...data.user })

      setEditing(false)
      setImageFile(null)
      setImagePreview(null)
      setImgBroken(false)
      toast.success('Profil mis à jour.')
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || 'Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <div className="w-12 h-1 bg-amber-400 rounded-full mt-1" />
      </div>

      <ErrorMessage message={error} retry={loadProfile} />

      {profile && (
        <div className="max-w-2xl bg-white rounded-2xl shadow-sm p-6">

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {(imagePreview || profile.profile_image) && !imgBroken ? (
                <img
                  src={imagePreview || profile.profile_image?.replace('http://localhost/', 'http://localhost:8000/')}
                  alt={profile.name}
                  onError={() => setImgBroken(true)}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-2xl">
                  {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow"
                >
                  ✏️
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <p className="font-bold text-gray-900">{profile.name}</p>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                {ROLE_LABELS[profile.role] ?? profile.role}
              </span>
              {profile.role === 'seller' && (
                <p className="text-xs text-gray-400 mt-1">
                  ⭐ {Number(profile.rating).toFixed(1)} ({profile.total_reviews} avis)
                </p>
              )}
            </div>
          </div>

          {!editing ? (
            // ─── Mode lecture ──────────────────────────────────────────────
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-sm text-gray-800">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Téléphone</p>
                <p className="text-sm text-gray-800">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Ville</p>
                <p className="text-sm text-gray-800">{profile.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Bio</p>
                <p className="text-sm text-gray-800 whitespace-pre-line">{profile.bio || '—'}</p>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="self-start mt-2 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Modifier mon profil
              </button>
            </div>
          ) : (
            // ─── Mode édition ──────────────────────────────────────────────
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Nom" name="name" value={form.name} onChange={handleChange} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
              </div>

              <Field label="Téléphone" name="phone" value={form.phone} onChange={handleChange} placeholder="+221 ..." />
              <Field label="Ville" name="city" value={form.city} onChange={handleChange} placeholder="Dakar" />
              <TextArea label="Bio" name="bio" value={form.bio} onChange={handleChange} placeholder="Parlez un peu de vous..." />

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </Layout>
  )
}