/**
 * useCurrentUser — single source of truth for all auth-derived state.
 *
 * Every component that needs to know WHO is logged in or WHETHER someone
 * is logged in should import from here — never compute it inline from useAuth().
 *
 * Shape of auth metadata stored after login:
 *   { user_id, username, email, is_admin, user: { ...profile } }
 *
 * The JWT lives exclusively in an HTTP-only cookie and is never accessible to JS.
 */
import { useAuth } from '../context/AuthContext';

export function useCurrentUser() {
  const { auth } = useAuth();

  const isLoggedIn = Boolean(auth?.user_id);

  const userId = auth?.user_id ?? null;
  const username = auth?.username ?? auth?.user?.username ?? null;
  const email = auth?.email ?? auth?.user?.email ?? null;
  const avatarUrl = auth?.user?.avatar_url ?? auth?.avatar_url ?? null;
  const isAdmin = Boolean(
    auth?.is_admin ||
    auth?.user?.is_admin ||
    (email && email.toLowerCase() === 'charanajoseph@gmail.com')
  );

  /** True if the given username belongs to the currently logged-in user. */
  const isOwnerOf = (authorUsername) =>
    Boolean(username && authorUsername && username === authorUsername);

  return {
    isLoggedIn,
    userId,
    username,
    email,
    avatarUrl,
    isAdmin,
    isOwnerOf,
  };
}
