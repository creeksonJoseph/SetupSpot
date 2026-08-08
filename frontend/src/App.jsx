import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Eager load primary landing & main explore entry
import LandingPage from './Pages/LandingPage'
import ExplorePage from './Pages/ExplorePage'

/**
 * Safe lazy loader with auto-reload retry if a new deployment changed JS chunk hashes.
 */
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasAlreadyBeenReloaded = JSON.parse(
      window.sessionStorage.getItem('chunk_reload_retry') || 'false'
    )

    try {
      const component = await componentImport()
      window.sessionStorage.removeItem('chunk_reload_retry')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        window.sessionStorage.setItem('chunk_reload_retry', 'true')
        window.location.reload()
      }
      throw error
    }
  })
}

// Code-split secondary routes with lazyWithRetry
const LoginPage = lazyWithRetry(() => import('./Pages/LoginPage'))
const SignupPage = lazyWithRetry(() => import('./Pages/SignupPage'))
const ForgotPasswordPage = lazyWithRetry(() => import('./Pages/ForgotPasswordPage'))
const ResetPasswordPage = lazyWithRetry(() => import('./Pages/ResetPasswordPage'))
const Collections = lazyWithRetry(() => import('./Pages/Collections'))
const Create = lazyWithRetry(() => import('./Pages/Create'))
const SearchPage = lazyWithRetry(() => import('./Pages/SearchPage'))
const PostDetailPage = lazyWithRetry(() => import('./Pages/PostDetailPage'))
const FavouritesPage = lazyWithRetry(() => import('./Pages/FavouritesPage'))
const AccountPage = lazyWithRetry(() => import('./Pages/AccountPage'))
const SettingsPage = lazyWithRetry(() => import('./Pages/SettingsPage'))
const UserProfilePage = lazyWithRetry(() => import('./Pages/UserProfilePage'))
const PublicCollectionPage = lazyWithRetry(() => import('./Pages/PublicCollectionPage'))
const AdminPortalPage = lazyWithRetry(() => import('./Pages/AdminPortalPage'))
const NotFoundPage = lazyWithRetry(() => import('./Pages/NotFoundPage'))
const MobileUploadPage = lazyWithRetry(() => import('./Pages/MobileUploadPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Landing & Auth routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/mobile-upload" element={<MobileUploadPage />} />

              {/* Layout wrapper — nav sidebar is visible for app workspace routes */}
              <Route element={<Layout />}>
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="setup/:id" element={<PostDetailPage />} />
                <Route path="user/:username" element={<UserProfilePage />} />
                <Route path="collection/:id" element={<PublicCollectionPage />} />
                {/* Protected routes — auth required */}
                <Route
                  path="collections"
                  element={
                    <ProtectedRoute>
                      <Collections />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="favorites"
                  element={
                    <ProtectedRoute>
                      <FavouritesPage />
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
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute>
                      <AdminPortalPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all inside layout — sidebar stays visible */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Top-level catch-all — completely unmatched paths */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
