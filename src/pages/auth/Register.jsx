import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'buyer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#f9fafb',
    border: '1px solid #e5e7eb', borderRadius: '10px', color: '#111827',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }
  const focus = e => e.target.style.borderColor = '#F5A623'
  const blur = e => e.target.style.borderColor = '#e5e7eb'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await client.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
          EPF <span style={{ color: '#F5A623' }}>Market</span>
        </span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#F5A623', fontSize: '12px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                EPF MARKETPLACE
              </p>
              <h1 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', margin: 0 }}>
                Créer un compte
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
                Rejoignez la marketplace EPF
              </p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.25rem', color: '#b91c1c', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Nom complet</label>
                <input type="text" required value={form.name} placeholder="Votre nom"
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" required value={form.email} placeholder="votre@email.com"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Mot de passe</label>
                <input type="password" required value={form.password} placeholder="••••••••"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <input type="password" required value={form.password_confirmation} placeholder="••••••••"
                  onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Je suis</label>
                <select value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={focus} onBlur={blur}>
                  <option value="buyer">Acheteur</option>
                  <option value="seller">Vendeur</option>
                </select>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? '#d4a843' : '#F5A623', color: '#0f1923', fontWeight: '700', fontSize: '15px', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Inscription...' : "S'inscrire"}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px', color: '#9ca3af' }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#F5A623', fontWeight: '600', textDecoration: 'none' }}>Se connecter</Link>
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