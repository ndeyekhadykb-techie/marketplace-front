import client from '../api/client'

// Récupère les infos de l'utilisateur connecté
export const getMe = () =>
  client.get('/auth/me')

// Met à jour le profil (name, bio, phone, city, profile_image)
// formData car profile_image est un fichier -> multipart/form-data
// On force POST + _method=PUT (spoofing) car Laravel ne parse pas
// correctement le multipart sur une vraie requête PUT.
export const updateProfile = (formData) => {
  formData.append('_method', 'PUT')
  return client.post('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}