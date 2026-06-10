import client from '../api/client'

// ── Catalogue public ──────────────────────────────────────────────────────────

// Récupère la liste des produits
// params peut contenir : { page, per_page, category_id, status, sort }
export const getProducts = (params) =>
  client.get('/products', { params })

// Récupère un seul produit par son id
export const getProduct = (id) =>
  client.get(`/products/${id}`)

// Récupère toutes les catégories
export const getCategories = () =>
  client.get('/categories')

// Recherche globale
// type peut être : 'products' | 'sellers' | 'categories' | 'all'
export const search = (q, type = 'all') =>
  client.get('/search', { params: { q, type } })

// ── Vendeur ───────────────────────────────────────────────────────────────────

// Récupère les produits du vendeur connecté
export const getMyProducts = (params) =>
  client.get('/products/my-products', { params })

// Crée un produit (avec image donc multipart/form-data)
export const createProduct = (formData) =>
  client.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// Modifie un produit
// On utilise ?_method=PUT car Laravel ne lit pas bien le body en PUT avec FormData
export const updateProduct = (id, formData) =>
  client.post(`/products/${id}?_method=PUT`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// Supprime un produit
export const deleteProduct = (id) =>
  client.delete(`/products/${id}`)