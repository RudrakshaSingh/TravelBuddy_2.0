import { useAuth,useUser } from '@clerk/clerk-react';
import { useEffect, useRef,useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { COUNTRIES, GENDERS, LANGUAGE_LEVELS, LANGUAGES } from '../../data/enums';
// ... imports ...
import { useUserActions } from '../../redux/hooks/useUser';

export default function CompleteRegistration() {
  // Language Search State
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageRef = useRef(null);

  // Filter languages based on search
  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const navigate = useNavigate();
  const { registerUser, fetchProfile, isRegistering, error } = useUserActions();
  const hasChecked = useRef(false);

  const [formData, setFormData] = useState({
    mobile: '',
    dob: '',
    gender: '',
    nationality: '',
    languages: [],
  });
  
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Beginner' });

  const [showForm, setShowForm] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Nationality Search State
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const nationalityRef = useRef(null);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country => 
    country.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target)) {
        setShowNationalityDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    // Check if user has a profile in MongoDB
    try {
      setConnectionError(false);
      await fetchProfile();
      // User exists in backend, redirect to profile
      navigate('/profile', { replace: true });
    } catch (err) {
      // Check for network/connection errors first
      if (isNetworkError(err)) {
        console.error('Network error checking profile:', err);
        setConnectionError(true);
        setShowForm(false);
        return;
      }

      // Check if it's a "User not found" (404) or "Profile incomplete" (403)
      const status = err?.status || err?.response?.status;
      
      if (status === 404 || status === 403) {
        setShowForm(true);
      } else if (status === 401) {
        // Unauthorized, redirect to sign-in
        navigate('/sign-in', { replace: true });
      } else {
        // For other errors, treat as connection issue
        console.error('Error checking profile:', err);
        setConnectionError(true);
        setShowForm(false);
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

    if (!formData.nationality) {
      toast.error('Please select your nationality from the list');
      return;
    }

    if (formData.languages.length === 0) {
      toast.error('Please add at least one language');
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
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>


          <div ref={nationalityRef} className="relative">
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
              Nationality
            </label>
            <input
              type="text"
              id="nationality"
              value={nationalitySearch}
              onChange={(e) => {
                setNationalitySearch(e.target.value);
                setShowNationalityDropdown(true);
                setFormData(prev => ({ ...prev, nationality: '' })); // Reset selection on type
              }}
              onFocus={() => setShowNationalityDropdown(true)}
              placeholder="Search nationality..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              autoComplete="off"
            />
            
            {showNationalityDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, nationality: country }));
                        setNationalitySearch(country);
                        setShowNationalityDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-colors"
                    >
                      {country}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No countries found</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages (at least one required)
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div ref={languageRef} className="relative flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search language..."
                  value={languageSearch}
                  onChange={(e) => {
                    setLanguageSearch(e.target.value);
                    setShowLanguageDropdown(true);
                    setNewLanguage(prev => ({ ...prev, name: '' })); // Reset selection on type
                  }}
                  onFocus={() => setShowLanguageDropdown(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  autoComplete="off"
                />
                
                {showLanguageDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setNewLanguage(prev => ({ ...prev, name: lang }));
                            setLanguageSearch(lang);
                            setShowLanguageDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-colors"
                        >
                          {lang}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No languages found</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={newLanguage.level}
                  onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {LANGUAGE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (newLanguage.name.trim()) {
                      // Check if language already added
                      if (formData.languages.some(l => l.name === newLanguage.name.trim())) {
                        toast.error('Language already added');
                        return;
                      }
                      
                      setFormData({
                        ...formData,
                        languages: [...formData.languages, { ...newLanguage, name: newLanguage.name.trim() }]
                      });
                      setNewLanguage({ name: '', level: 'Beginner' });
                      setLanguageSearch('');
                    } else {
                       toast.error('Please select a language');
                    }
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Language List */}
            {formData.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    <span className="text-sm font-medium text-orange-800">{lang.name} - {lang.level}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newLangs = [...formData.languages];
                        newLangs.splice(index, 1);
                        setFormData({ ...formData, languages: newLangs });
                      }}
                      className="text-orange-400 hover:text-orange-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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

