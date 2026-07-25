import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
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

import MobileUploadPage from './Pages/MobileUploadPage'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/mobile-upload" element={<MobileUploadPage />} />

          {/* Layout wrapper — nav sidebar is visible for all children */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/explore" replace />} />

            {/* Public routes — no auth required */}
            <Route path="explore" element={<ExplorePage />} />
            <Route path="post/:id" element={<PostDetailPage />} />

            {/* Protected routes — auth required */}
            <Route
              path="favorites"
              element={
                <ProtectedRoute>
                  <FavouritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="collections"
              element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute>
                  <Create />
                </ProtectedRoute>
              }
            />
            <Route
              path="account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
