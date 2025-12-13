import { useAuth,useUser } from '@clerk/clerk-react';
import { Briefcase, Calendar, Edit2, Globe, Heart, Languages, Save, User, X } from 'lucide-react';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useUserActions } from '../../redux/hooks/useUser';

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const navigate = useNavigate();
  const { profile: reduxProfile, fetchProfile, updateProfile, isLoading, isUpdating, error } = useUserActions();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Check if error is a network/connection error
  const isNetworkError = (err) => {
    if (!err) return false;
    if (!err.status && !err.response?.status) return true;
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') return true;
    if (err.message?.includes('Network Error')) return true;
    if (err.message?.includes('ERR_CONNECTION_REFUSED')) return true;
    return false;
  };

  const loadProfile = async () => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      navigate('/sign-in', { replace: true });
      return;
    }

    // If profile is already loaded in Redux (from AuthGuard), use it
    if (reduxProfile) {
      setProfile(reduxProfile);
      setEditData(reduxProfile);
      setLoadingProfile(false);
      return;
    }

    setConnectionError(false);
    setLoadingProfile(true);

    try {
      const response = await fetchProfile();
      setProfile(response.data);
      setEditData(response.data);
    } catch (err) {
      // Check for network/connection errors first
      if (isNetworkError(err)) {
        console.error('Network error loading profile:', err);
        setConnectionError(true);
        setLoadingProfile(false);
        return;
      }

      // User not registered in backend, redirect to complete registration
      const status = err?.status || err?.response?.status;
      // Backend returns 403 for users without MongoDB profile, also handle 404
      if (status === 403 || status === 404) {
        navigate('/complete-registration', { replace: true });
      } else {
        toast.error(err?.message || 'Failed to load profile');
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // When reduxProfile changes (from AuthGuard fetch), update local state
  useEffect(() => {
    if (reduxProfile && !profile) {
      setProfile(reduxProfile);
      setEditData(reduxProfile);
      setLoadingProfile(false);
    }
  }, [reduxProfile]);

  useEffect(() => {
    loadProfile();
  }, [isAuthLoaded, isUserLoaded, isSignedIn]);

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await updateProfile(editData);
      setProfile(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  if (!isAuthLoaded || !isUserLoaded || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show connection error with retry option
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please check your connection and try again.
          </p>
          <button
            onClick={() => loadProfile()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't load your profile. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
                  {clerkUser?.imageUrl ? (
                    <img
                      src={clerkUser.imageUrl}
                      alt={clerkUser?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-white font-bold">
                      {clerkUser?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{clerkUser?.fullName || `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 'User'}</h1>
                  <p className="text-gray-500">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md disabled:opacity-50"
                    >
                      <Save size={18} />
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-md"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-orange-500" size={24} />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Full Name (from Clerk)</label>
                <p className="text-gray-900 font-medium">{clerkUser?.fullName || `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 'User'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Mobile</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.mobile || ''}
                    onChange={(e) => handleEditChange('mobile', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.mobile}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                {isEditing ? (
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => handleEditChange('gender', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{profile.gender}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} />
                  Date of Birth
                </label>
                <p className="text-gray-900 font-medium">{formatDate(profile.dob)}</p>
              </div>
            </div>
          </div>

          {/* Travel Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="text-orange-500" size={24} />
              Travel Style
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Travel Style</label>
                {isEditing ? (
                  <select
                    value={editData.travelStyle || 'Solo'}
                    onChange={(e) => handleEditChange('travelStyle', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Group">Group</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Backpacking">Backpacking</option>
                    <option value="Business">Business</option>
                    <option value="Family">Family</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">{profile.travelStyle || 'Solo'}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Globe size={14} />
                  Nationality
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nationality || ''}
                    onChange={(e) => handleEditChange('nationality', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.nationality || 'Not Specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="text-orange-500" size={24} />
              About Me
            </h2>
            {isEditing ? (
              <textarea
                value={editData.bio || ''}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-gray-700">{profile.bio || 'Not Updated Yet'}</p>
            )}
          </div>

          {/* Interests Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="text-orange-500" size={24} />
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No interests added yet</p>
              )}
            </div>
          </div>

          {/* Languages Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Languages className="text-orange-500" size={24} />
              Languages
            </h2>
            <div className="space-y-2">
              {profile.languages && profile.languages.length > 0 ? (
                profile.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-900">{lang.name}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      {lang.level}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No languages added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
