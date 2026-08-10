/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Wrap any route that requires auth with this component.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useCurrentUser();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
