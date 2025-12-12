import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService, createAuthenticatedApi } from '../services/api';

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  isRegistering: false,
  isUpdating: false,
  error: null,
  isRegistered: false,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'user/register',
  async ({ getToken, clerkUser, additionalData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const userData = {
        clerk_id: clerkUser.id,
        ...additionalData,
      };
      const response = await userService.register(authApi, userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async ({ getToken }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.getProfile(authApi);
      return response;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || error.message || 'Failed to fetch profile'
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ getToken, profileData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.updateProfile(authApi, profileData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update profile'
      );
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.isRegistered = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isRegistered = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isRegistering = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isRegistering = false;
        state.profile = action.payload.data;
        state.isRegistered = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegistering = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
        state.isRegistered = true;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearProfile, setProfile } = userSlice.actions;
export default userSlice.reducer;
