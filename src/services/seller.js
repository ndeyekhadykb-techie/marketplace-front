import client from '../api/client'

// Récupère les données résumées du tableau de bord vendeur
// Contient : nombre de produits, commandes récentes, revenus du mois...
export const getDashboard = () =>
  client.get('/seller/dashboard')

// Récupère les statistiques détaillées du vendeur
// Contient : graphiques de ventes, produits les plus vendus...
export const getStatistics = () =>
  client.get('/seller/statistics')