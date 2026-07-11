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
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#f9fafb',
    border: '1px solid #e5e7eb', borderRadius: '10px', color: '#111827',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
          EPF <span style={{ color: '#F5A623' }}>Market</span>
        </span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#F5A623', fontSize: '12px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                EPF MARKETPLACE
              </p>
              <h1 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', margin: 0 }}>
                Bienvenue !
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
                Connectez-vous pour continuer
              </p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.25rem', color: '#b91c1c', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email</label>
                <input type="email" required value={form.email} placeholder="votre@email.com"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Mot de passe</label>
                <input type="password" required value={form.password} placeholder="••••••••"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? '#d4a843' : '#F5A623', color: '#0f1923', fontWeight: '700', fontSize: '15px', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: '#9ca3af' }}>
              Pas de compte ?{' '}
              <Link to="/register" style={{ color: '#F5A623', fontWeight: '600', textDecoration: 'none' }}>S'inscrire</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '12px', color: '#d1d5db' }}>
            Vendeurs vérifiés · Paiement sécurisé · EPF Africa
          </p>
        </div>
      </div>
    </div>
  )
}