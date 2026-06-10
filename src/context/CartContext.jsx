import { createContext, useContext, useReducer } from 'react'
import client from '../api/client'

// État initial du panier
const initialState = {
  items: [],
  loading: false,
  error: null,
}

// Toutes les mutations passent ici
function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false, error: null }
    case 'CLEAR':
      return { ...initialState }
    default:
      return state
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Valeurs calculées à la volée depuis items
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const total     = state.items.reduce((sum, i) => sum + i.price_at_add * i.quantity, 0)

  // Récupère les items depuis l'API
  async function fetchCart() {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data } = await client.get('/cart/items')
      dispatch({ type: 'SET_ITEMS', payload: data.data ?? data })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message ?? 'Erreur panier' })
    }
  }

  // Ajouter un produit
  async function addItem(productId, quantity = 1) {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await client.post('/cart/add', { product_id: productId, quantity })
      await fetchCart()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message ?? 'Erreur ajout' })
      throw err
    }
  }

  // Modifier la quantité
  async function updateItem(cartItemId, quantity) {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await client.put(`/cart/items/${cartItemId}`, { quantity })
      await fetchCart()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message ?? 'Erreur maj' })
      throw err
    }
  }

  // Supprimer un item
  async function removeItem(cartItemId) {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await client.delete(`/cart/items/${cartItemId}`)
      await fetchCart()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message ?? 'Erreur suppression' })
      throw err
    }
  }

  // Vider le panier
  async function clearCart() {
    try {
      await client.delete('/cart/clear')
      dispatch({ type: 'CLEAR' })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message ?? 'Erreur vidage' })
      throw err
    }
  }

  return (
    <CartContext.Provider value={{
      items: state.items,
      loading: state.loading,
      error: state.error,
      itemCount,
      total,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook : const { items, addItem } = useCart()
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans un <CartProvider>')
  return ctx
}