/**
 * ProtectedRoute — shows an auth-gate UI for unauthenticated users
 * instead of silently redirecting. Wrap any route that requires auth
 * with this component.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Lock } from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useCurrentUser();
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Lock icon */}
        <div
          className="flex items-center justify-center w-14 h-14 mb-5 border"
          style={{
            backgroundColor: 'rgba(0,102,255,0.06)',
            borderColor: 'rgba(0,102,255,0.18)',
            color: '#0066ff',
          }}
        >
          <Lock size={24} />
        </div>

        {/* Heading */}
        <h2
          className="text-xl font-black tracking-tight mb-1"
          style={{ color: '#0F172A' }}
        >
          Sign in to continue
        </h2>

        {/* Sub-text */}
        <p
          className="text-sm mb-6 max-w-xs"
          style={{ color: '#475569' }}
        >
          This page is only available to signed-in users.
        </p>

        {/* Sharp-cornered Sign In button */}
        <Link
          to="/login"
          state={{ from: location }}
          id="protected-route-signin-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{
            backgroundColor: '#0066ff',
            borderRadius: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0050cb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066ff')}
        >
          <LogIn size={15} />
          Sign In
        </Link>
      </div>
    );
  }

  return children;
}
