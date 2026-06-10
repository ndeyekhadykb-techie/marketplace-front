import client from '../api/client'

// ── Acheteur ──────────────────────────────────────────────────────────────────

// Passer une commande
// payload contient : { shipping_address, shipping_city, shipping_postal_code, shipping_phone, coupon_code? }
export const createOrder = (payload) =>
  client.post('/orders', payload)

// Récupère toutes les commandes de l'acheteur connecté
export const getMyOrders = () =>
  client.get('/orders/my-orders')

// Récupère le détail d'une commande par son id
export const getOrder = (id) =>
  client.get(`/orders/${id}`)

// ── Vendeur ───────────────────────────────────────────────────────────────────

// Récupère les commandes qui contiennent les produits du vendeur connecté
export const getSellerOrders = () =>
  client.get('/seller/orders')

// Met à jour le statut d'un article de commande
// status peut être : 'pending' | 'shipped' | 'delivered'
export const updateOrderItemStatus = (itemId, status) =>
  client.put(`/seller/order-items/${itemId}`, { status })