/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Wrap any route that requires auth with this component.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.user_id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
