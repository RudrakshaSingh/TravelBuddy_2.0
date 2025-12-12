import { useDispatch, useSelector } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useCallback } from 'react';
import {
  registerUser,
  fetchProfile,
  updateProfile,
  clearError,
  clearProfile,
} from '../slices/userSlice';

// Custom hook for user actions with Redux
export const useUserActions = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const { profile, isLoading, isRegistering, isUpdating, error, isRegistered } =
    useSelector((state) => state.user);

  const handleRegister = useCallback(
    async (additionalData) => {
      if (!clerkUser) {
        throw new Error('Not authenticated');
      }
      return dispatch(
        registerUser({ getToken, clerkUser, additionalData })
      ).unwrap();
    },
    [dispatch, getToken, clerkUser]
  );

  const handleFetchProfile = useCallback(async () => {
    return dispatch(fetchProfile({ getToken })).unwrap();
  }, [dispatch, getToken]);

  const handleUpdateProfile = useCallback(
    async (profileData) => {
      return dispatch(updateProfile({ getToken, profileData })).unwrap();
    },
    [dispatch, getToken]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearProfile = useCallback(() => {
    dispatch(clearProfile());
  }, [dispatch]);

  return {
    // State
    profile,
    isLoading,
    isRegistering,
    isUpdating,
    error,
    isRegistered,
    clerkUser,

    // Actions
    registerUser: handleRegister,
    fetchProfile: handleFetchProfile,
    updateProfile: handleUpdateProfile,
    clearError: handleClearError,
    clearProfile: handleClearProfile,
  };
};

// Export typed hooks for convenience
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
