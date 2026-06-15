import client from '../api/client'

// Récupère tous les produits mis en favoris par l'acheteur connecté
export const getFavorites = () =>
  client.get('/favorites')

// Ajoute un produit aux favoris
export  const addFavorite    = (productId) => 
        client.post('/favorites/add', { product_id: productId })

// Retire un produit des favoris
export const removeFavorite = (productId) =>
  client.delete(`/favorites/${productId}`)