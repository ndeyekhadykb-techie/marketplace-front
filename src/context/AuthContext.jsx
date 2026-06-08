import { createContext, useContext, useState } from 'react'
import { loginAPI, registerAPI, logoutAPI } from '../api/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  const login = async (email, password) => {
  // On appelle la fonction Axios centralisée
  const data = await loginAPI(email, password)
  
  // On stocke les infos
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  setUser(data.user)
  
  return data.user
}

const register = async (userData) => {
  // On appelle l'API d'inscription
  const data = await registerAPI(userData)
  
  // Puisqu'on reçoit un token au succès, on le connecte direct !
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  setUser(data.user)
  
  return data.user
}

  const logout = async () => {
  try {
    //  On avertit le serveurpour détruire le token
    await logoutAPI()
  } catch (error) {
    console.error("Erreur lors de la déconnexion côté serveur:", error)
  } finally {
    //  Quoi qu'il arrive, on nettoie le navigateur
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }
}
return (
  <AuthContext.Provider value={{ user, login, register, logout }}>
    {children}
  </AuthContext.Provider>
)
}

export const useAuth = () => useContext(AuthContext)