import { useAuth } from '@clerk/clerk-react';
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  fetchMyBookingsAsGuide,
  fetchMyGuideProfile,
  toggleGuideStatus,
} from '../../redux/slices/guideSlice';

const GuideDashboard = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { myGuideProfile, guideBookings, bookingsLoading, loading } = useSelector(
    (state) => state.guide
  );

  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    dispatch(fetchMyGuideProfile({ getToken }));
    dispatch(fetchMyBookingsAsGuide({ getToken }));
  }, [dispatch, getToken]);

  useEffect(() => {
    if (myGuideProfile === null && !loading) {
      navigate('/guide-setup');
    }
  }, [myGuideProfile, loading, navigate]);

  const handleToggleStatus = async () => {
    try {
      await dispatch(toggleGuideStatus({ getToken })).unwrap();
      toast.success(myGuideProfile?.isActive ? 'Guide mode disabled' : 'Guide mode enabled');
    } catch (error) {
      toast.error(error || 'Failed to toggle guide status');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await dispatch(confirmBooking({ getToken, bookingId })).unwrap();
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error(error || 'Failed to confirm booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await dispatch(cancelBooking({ getToken, bookingId, reason: 'Cancelled by guide' })).unwrap();
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error(error || 'Failed to cancel booking');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await dispatch(completeBooking({ getToken, bookingId })).unwrap();
      toast.success('Booking marked as completed!');
    } catch (error) {
      toast.error(error || 'Failed to complete booking');
    }
  };

  const filteredBookings = guideBookings.filter((booking) => booking.status === activeTab);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingCount = guideBookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = guideBookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = guideBookings.filter((b) => b.status === 'completed').length;
  const totalEarnings = guideBookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (!myGuideProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Guide Dashboard</h1>
            <p className="flex items-center gap-1 text-gray-500 mt-1">
              <MapPin size={14} />
              {myGuideProfile.city}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/guide-setup">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                <Edit size={16} />
                Edit Profile
              </button>
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl">
              <span className="text-sm font-medium text-gray-600">
                {myGuideProfile.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={handleToggleStatus}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  myGuideProfile.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    myGuideProfile.isActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pending</span>
              <Clock size={18} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Confirmed</span>
              <Calendar size={18} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Completed</span>
              <Users size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Earnings</span>
              <DollarSign size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">₹{totalEarnings}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Rating</span>
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {myGuideProfile.averageRating?.toFixed(1) || 'New'}
            </p>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {['pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <Calendar size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-700">No {activeTab} bookings</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.traveler?.profileImage || '/default-avatar.png'}
                          alt={booking.traveler?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{booking.traveler?.name}</p>
                          <p className="text-sm text-gray-500">{booking.traveler?.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {booking.duration}h
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-orange-600">
                        <DollarSign size={14} />
                        ₹{booking.totalPrice}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}

                    <div className="flex gap-3">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmBooking(booking._id)}
                            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleCompleteBooking(booking._id)}
                            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-green-600 text-sm font-medium">✓ Tour completed</span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-gray-500 text-sm">{booking.cancellationReason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;
