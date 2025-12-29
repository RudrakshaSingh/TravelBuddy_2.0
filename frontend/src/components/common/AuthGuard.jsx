import { useAuth } from '@clerk/clerk-react';
import { useCallback,useEffect, useState } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';

import { useUserActions } from '../../redux/hooks/useUser';

// Check if error is a network/connection error
const isNetworkError = (err) => {
  if (!err) return false;
  // No status means network error (connection refused, timeout, etc.)
  if (!err.status && !err.response?.status) return true;
  // Axios network errors
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') return true;
  if (err.message?.includes('Network Error')) return true;
  if (err.message?.includes('ERR_CONNECTION_REFUSED')) return true;
  return false;
};


/**
 * AuthGuard component that checks authentication state and redirects accordingly:
 * - Not signed in with Clerk → redirect to /sign-in
 * - Signed in but no MongoDB profile → redirect to /complete-registration
 * - Signed in with profile → render children
 */
export default function AuthGuard({ children, requireProfile = true }) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { fetchProfile, profile } = useUserActions();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const checkAuth = useCallback(async () => {
    // Wait for Clerk to load
    if (!isAuthLoaded) return;

    // Not signed in → go to login
    if (!isSignedIn) {
      navigate('/sign-in', { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // If we don't require profile check, just render
    if (!requireProfile) {
      setIsChecking(false);
      setHasProfile(true);
      return;
    }

    // Check if user has a profile in MongoDB
    try {
      setConnectionError(false);
      await fetchProfile();
      setHasProfile(true);
    } catch (err) {
      // Check for network/connection errors first
      if (isNetworkError(err)) {
        console.error('Network error checking profile:', err);
        setConnectionError(true);
        setIsChecking(false);
        return;
      }

      // The error from redux thunk has status in the payload
      const status = err?.status;
      
      // Check if it's a "profile incomplete" error (403) or user not found (404)
      if (status === 403 || status === 404) {
        navigate('/complete-registration', { replace: true });
        return;
      }
      // For other errors (like 401), redirect to login
      if (status === 401) {
        navigate('/sign-in', { replace: true });
        return;
      }
      // For unknown errors, log but don't redirect to complete-registration
      // as we can't verify if profile exists
      console.error('Error checking profile:', err);
      setConnectionError(true);
    } finally {
      setIsChecking(false);
    }
  }, [isAuthLoaded, isSignedIn, requireProfile, navigate, location.pathname, fetchProfile]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading while checking auth state (only use local isChecking, not global isLoading)
  if (!isAuthLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show connection error with retry option
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please check your connection and try again.
          </p>
          <button
            onClick={() => {
              setIsChecking(true);
              setConnectionError(false);
              checkAuth();
            }}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If not signed in, don't render (will redirect)
  if (!isSignedIn) {
    return null;
  }

  // If we require profile and don't have one, don't render (will redirect)
  if (requireProfile && !hasProfile && !profile) {
    return null;
  }

  return children;
}
