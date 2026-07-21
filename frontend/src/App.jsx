import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './Pages/LoginPage'
import SignupPage from './Pages/SignupPage'
import ForgotPasswordPage from './Pages/ForgotPasswordPage'
import ResetPasswordPage from './Pages/ResetPasswordPage'
import Collections from './Pages/Collections'
import Create from './Pages/Create'
import ExplorePage from './Pages/ExplorePage'
import PostDetailPage from './Pages/PostDetailPage'
import FavouritesPage from './Pages/FavouritesPage'
import AccountPage from './Pages/AccountPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected app routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/explore" replace />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="favorites" element={<FavouritesPage />} />
            <Route path="collections" element={<Collections />} />
            <Route path="create" element={<Create />} />
            <Route path="post/:id" element={<PostDetailPage />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
