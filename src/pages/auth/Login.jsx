import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const user = await login(form.email, form.password)
    if (user.role === 'seller') navigate('/seller/dashboard')
    else if (user.role === 'admin') navigate('/admin')
    else navigate('/')
  } catch (err) {
    // Si le serveur a renvoyé une réponse (401, 422, 429, etc.)
    if (err.response && err.response.data) {
      setError(err.response.data.message || 'Une erreur est survenue')
    } else {
      // Si le serveur est éteint ou inaccessible
      setError('Impossible de contacter le serveur. Veuillez réessayer plus tard.')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="buyer@example.com"
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
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-600">
          Pas de compte ? <Link to="/register" className="text-blue-600 hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}