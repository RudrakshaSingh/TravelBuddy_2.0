import { useAuth,useUser } from '@clerk/clerk-react';
import { useEffect, useRef,useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useUserActions } from '../../redux/hooks/useUser';

export default function CompleteRegistration() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const navigate = useNavigate();
  const { registerUser, fetchProfile, isRegistering, error } = useUserActions();
  const hasChecked = useRef(false);

  const [formData, setFormData] = useState({
    mobile: '',
    dob: '',
    gender: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

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

  // Check if user already exists in backend
  const checkExistingUser = async () => {
    if (!isAuthLoaded || !isUserLoaded || !isSignedIn) return;

    setConnectionError(false);
    setIsCheckingUser(true);

    try {
      await fetchProfile();
      // User exists in backend, redirect to profile
      navigate('/profile', { replace: true });
    } catch (err) {
      // Check for network/connection errors
      if (isNetworkError(err)) {
        console.error('Network error checking profile:', err);
        setConnectionError(true);
        setShowForm(false);
      } else {
        // Only show form if it's actually a "user not found" error (404 or 403)
        const status = err?.status;
        if (status === 404 || status === 403) {
          setShowForm(true);
        } else {
          // For other errors, treat as connection issue
          console.error('Error checking profile:', err);
          setConnectionError(true);
          setShowForm(false);
        }
      }
    } finally {
      setIsCheckingUser(false);
    }
  };

  useEffect(() => {
    if (!hasChecked.current && isAuthLoaded && isUserLoaded && isSignedIn) {
      hasChecked.current = true;
      checkExistingUser();
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.dob) {
      toast.error('Please enter your date of birth');
      return;
    }

    if (!formData.gender) {
      toast.error('Please select your gender');
      return;
    }

    try {
      await registerUser(formData);
      toast.success('Registration completed successfully!');
      navigate('/profile', { replace: true });
    } catch (err) {
      // Error is now a string from the redux slice
      const errorMessage = typeof err === 'string' ? err : (err?.message || error || 'Registration failed. Please try again.');
      toast.error(errorMessage);
    }
  };

  if (!isAuthLoaded || !isUserLoaded || isCheckingUser) {
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
              hasChecked.current = false;
              setConnectionError(false);
              checkExistingUser();
            }}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !showForm) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl text-white font-bold">
                {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.firstName || 'there'}! Just a few more details to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRegistering ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Completing Registration...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

