import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/products/ProductsPage'
import DashboardPage from './pages/seller/DashboardPage'
import ProductFormPage from './pages/seller/ProductFormPage'
import MyProductsPage from './pages/seller/MyProductsPage'
import SellerMessagePage from './pages/seller/SellerMessagePage'
import SellerOrdersPage from './pages/seller/SellerOrdersPage'
import SellerStatisticsPage from './pages/seller/SellerStatisticsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import UsersPage from './pages/admin/UsersPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import CouponsPage from './pages/admin/CouponsPage'
import { Toaster } from 'react-hot-toast'
import CartPage from './pages/buyer/CartPage'
import CheckoutPage from './pages/buyer/CheckoutPage'
import OrdersPage from './pages/buyer/OrdersPage'
import OrderDetailPage from './pages/buyer/OrderDetailPage'
import FavoritesPage from './pages/buyer/FavoritesPage'
import MessagesPage from './pages/buyer/MessagesPage'
import ProductDetailPage from './pages/products/ProductDetailPage'




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
  <>
    <Toaster position="top-right" />
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Route accessible à TOUS les utilisateurs connectés */}
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />

      {/* Routes vendeur */}
      <Route path="/seller/dashboard" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/seller/products/new" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <ProductFormPage />
        </ProtectedRoute>
      } />
      <Route path="/seller/products" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <MyProductsPage />
        </ProtectedRoute>
      } />
      <Route path="/seller/products/:id/edit" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <ProductFormPage />
        </ProtectedRoute>
      } />
      <Route path="/seller/messages" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <SellerMessagePage />
        </ProtectedRoute>
      } />


      <Route path="/seller/orders" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <SellerOrdersPage />
        </ProtectedRoute>
      } />

      <Route path="/seller/products/:id/edit" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <ProductFormPage />
        </ProtectedRoute>
      } />

      <Route path="/seller/statistics" element={
        <ProtectedRoute allowedRoles={['seller']}>
          <SellerStatisticsPage />
        </ProtectedRoute>
     } />
      {/* Route admin */}
            <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminProductsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/coupons" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <CouponsPage />
        </ProtectedRoute>
      } />

      {/* Routes buyer */}
      <Route path="/products" element={
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <CartPage />
        </ProtectedRoute>
      } />


    <Route path="/checkout" element={
      <ProtectedRoute allowedRoles={['buyer']}>
        <CheckoutPage />
      </ProtectedRoute>
    } />

    <Route path="/orders" element={
      <ProtectedRoute allowedRoles={['buyer']}>
        <OrdersPage />
      </ProtectedRoute>
    } />
    
    <Route path="/orders/:id" element={
      <ProtectedRoute allowedRoles={['buyer']}>
        <OrderDetailPage />
      </ProtectedRoute>
    } />

    <Route path="/favorites" element={
      <ProtectedRoute allowedRoles={['buyer']}>
        <FavoritesPage />
      </ProtectedRoute>
    } />

    <Route path="/messages" element={
      <ProtectedRoute allowedRoles={['buyer']}>
        <MessagesPage />
      </ProtectedRoute>
    } />

    <Route path="/products/:id" element={
      <ProtectedRoute>
        <ProductDetailPage />
      </ProtectedRoute>
    } />


    </Routes>
  </>
)
}