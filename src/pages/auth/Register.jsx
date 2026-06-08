import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  //  nos états locaux indispensables pour gérer le formulaire
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '', 
    role: 'buyer' 
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Appel de l'inscription via le contexte global
      const user = await register(form)
      
      // Redirection automatique selon le rôle retourné
      if (user.role === 'seller') navigate('/seller/dashboard')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/')
      
    } catch (apiError) {
      // Gestion propre de l'erreur sans conflit de variable
      setError(apiError.response?.data?.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>
        
        {/* Correction de la condition ici : on utilise "error" */}
        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input type="text" required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input type="password" required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
            <input type="password" required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password_confirmation}
              onChange={e => setForm({...form, password_confirmation: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="buyer">Acheteur</option>
              <option value="seller">Vendeur</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-600">
          Déjà un compte ? <Link to="/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}