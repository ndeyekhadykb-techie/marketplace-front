import client from '../api/client'

// Récupère les données résumées du tableau de bord vendeur
// Contient : nombre de produits, commandes récentes, revenus du mois...
export const getDashboard = () =>
  client.get('/seller/dashboard')

// Récupère les statistiques détaillées du vendeur
// Contient : graphiques de ventes, produits les plus vendus...
export const getStatistics = () =>
  client.get('/seller/statistics')

// Récupère le profil public d'un vendeur par son id
// Utilisé notamment pour pré-remplir une conversation quand un acheteur
// contacte un vendeur pour la première fois (pas encore d'historique de messages)
// Réponse : objet plat { id, name, email, bio, profile_image, phone, city, rating, ... }
export const getSeller = (userId) =>
  client.get(`/sellers/${userId}`)