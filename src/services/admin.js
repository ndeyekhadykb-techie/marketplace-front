import client from '../api/client'

// ── Statistiques ──────────────────────────────────────────────────────────────

// Récupère les statistiques globales de la plateforme
// Contient : nombre d'utilisateurs, produits, commandes, revenus...
export const getStats = () =>
  client.get('/admin/stats')

// ── Utilisateurs ──────────────────────────────────────────────────────────────

// Récupère la liste de tous les utilisateurs
export const getUsers = () =>
  client.get('/admin/users')

// Suspend un utilisateur — il ne peut plus se connecter
export const suspendUser = (id) =>
  client.post(`/admin/users/${id}/suspend`)

// Réactive un utilisateur suspendu
export const reactivateUser = (id) =>
  client.post(`/admin/users/${id}/reactivate`)

// ── Produits ──────────────────────────────────────────────────────────────────

// Force le statut d'un produit (published, inactive, sold...)
export const forceProductStatus = (id, status) =>
  client.put(`/admin/products/${id}`, { status })

// Supprime définitivement un produit
export const forceDeleteProduct = (id) =>
  client.delete(`/admin/products/${id}`)

// ── Coupons ───────────────────────────────────────────────────────────────────

// Récupère tous les coupons de réduction
export const getCoupons = () =>
  client.get('/admin/coupons')

// Crée un nouveau coupon
// data contient : { code, type, value, usage_limit, min_order_total, starts_at, ends_at }
export const createCoupon = (data) =>
  client.post('/admin/coupons', data)

// Modifie un coupon existant
export const updateCoupon = (id, data) =>
  client.put(`/admin/coupons/${id}`, data)

// Supprime un coupon
export const deleteCoupon = (id) =>
  client.delete(`/admin/coupons/${id}`)