import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import HomePage from './pages/HomePage'

// On améliore la fonction pour qu'elle accepte "allowedRoles"
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()

  //  Si l'utilisateur n'est pas connecté, redirection vers le login
  if (!user) {
    return <Navigate to="/login" />
  }

  //  Si la route demande un rôle spécifique et que l'utilisateur ne l'a pas
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // On le redirige vers l'accueil pour le bloquer
    return <Navigate to="/" />
  }

  // Si tout est bon, on affiche la page
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Route accessible à TOUS les utilisateurs connectés */}
      <Route path="/" element={
        <ProtectedRoute>
           <HomePage/>
        </ProtectedRoute>
      } />

      {/* Route réservée uniquement aux vendeurs */}
      <Route path="/seller/dashboard" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <div className="p-8 text-xl">Dashboard du Vendeur</div>
        </ProtectedRoute>
      } />

      {/* Route réservée uniquement aux admins */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <div className="p-8 text-xl">Panneau d'administration</div>
        </ProtectedRoute>
      } />

      {/* */}
     
    </Routes>
    
  )
}