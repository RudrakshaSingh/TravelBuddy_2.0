import { useAuth } from '@clerk/clerk-react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  Upload,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchPosts, toggleLike, incrementShare, addComment } from '../../redux/slices/postSlice';

// Image Carousel Component
function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-full group">
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
        }}
      />

      {/* Navigation Arrows - Only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight size={20} />
          </button>

          {/* Image Counter */}
          <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserPosts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { posts, isLoading, pagination, error } = useSelector((state) => state.post);
  const [currentPage, setCurrentPage] = useState(1);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});

  // Fetch posts on component mount
  useEffect(() => {
    dispatch(fetchPosts({
      getToken,
      page: currentPage,
      limit: 12,
      visibility: 'Public'
    }));
  }, [dispatch, getToken, currentPage]);

  // Handle like/unlike
  const handleLike = async (postId) => {
    console.log('Like button clicked for post:', postId);

    try {
      // Call API - Redux will handle state update automatically
      const result = await dispatch(toggleLike({ getToken, id: postId })).unwrap();
      console.log('Like API response:', result);

      // Success feedback
      toast.success(result.data.liked ? '❤️ Liked!' : '💔 Unliked');

      // Force refresh the posts to ensure UI updates
      dispatch(fetchPosts({
        getToken,
        page: currentPage,
        limit: 12,
        visibility: 'Public'
      }));
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to update like: ' + (err.message || err));
    }
  };

  // Toggle comment section visibility
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Handle add comment
  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await dispatch(addComment({ getToken, id: postId, text })).unwrap();
      toast.success('Comment added! 💬');

      // Clear input
      setCommentText(prev => ({
        ...prev,
        [postId]: ''
      }));

      // Refresh posts
      dispatch(fetchPosts({
        getToken,
        page: currentPage,
        limit: 12,
        visibility: 'Public'
      }));
    } catch (err) {
      console.error('Comment error:', err);
      toast.error('Failed to add comment');
    }
  };

  // Handle share
  const handleShare = async (postId, postCaption) => {
    try {
      await dispatch(incrementShare({ getToken, id: postId }));

      // Native share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Travel Post',
          text: postCaption,
          url: `${window.location.origin}/user-posts`,
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(`${window.location.origin}/user-posts`);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Load more posts
  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <Camera className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Travel Stories</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Explore Travel Moments
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing travel experiences shared by our community of adventurers
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && currentPage === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading travel stories...</p>
          </div>
        ) : posts.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Camera className="text-amber-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your travel story!</p>
            <button
              onClick={() => navigate('/upload-post')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* User Header */}
                  <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                    <img
                      src={post.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                      {post.userLocation && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {post.userLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image Carousel */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {post.images && post.images.length > 0 ? (
                      <ImageCarousel images={post.images} />
                    ) : (
                      <img
                        src={'https://via.placeholder.com/600x600?text=No+Image'}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Heart
                          size={22}
                          className={post.likes?.includes(post.userId) ? 'fill-red-500 text-red-500' : ''}
                        />
                        <span className="text-sm font-semibold">{post.likesCount || 0}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors"
                      >
                        <MessageCircle size={22} />
                        <span className="text-sm font-semibold">{post.commentsCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleShare(post._id, post.caption)}
                        className="ml-auto flex items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors"
                      >
                        <Share2 size={22} />
                        {post.shares > 0 && (
                          <span className="text-sm font-semibold">{post.shares}</span>
                        )}
                      </button>
                    </div>

                    {/* Location */}
                    {post.location?.name && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <MapPin size={14} />
                        <span className="text-sm font-medium">{post.location.name}</span>
                      </div>
                    )}

                    {/* Caption */}
                    <div className="max-h-20 overflow-y-auto hide-scrollbar">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {post.caption}
                      </p>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400">{formatTimestamp(post.createdAt)}</p>

                    {/* Comments Section */}
                    {showComments[post._id] && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {/* Existing Comments */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar pr-2">
                            {post.comments.map((comment, idx) => (
                              <div key={idx} className="flex gap-2">
                                <img
                                  src={comment.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                                  alt={comment.userName}
                                  className="w-6 h-6 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                                  <p className="text-xs font-semibold text-gray-900">{comment.userName}</p>
                                  <p className="text-xs text-gray-700">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentText[post._id] || ''}
                            onChange={(e) => setCommentText(prev => ({
                              ...prev,
                              [post._id]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post._id);
                              }
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-white border-2 border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More Stories</>
                  )}
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-sm text-gray-500">
              Showing {posts.length} of {pagination.totalPosts || 0} posts
              {pagination.totalPages > 1 && (
                <> · Page {pagination.currentPage} of {pagination.totalPages}</>
              )}
            </div>
          </>
        )}

        {/* Create Post Button (Fixed) */}
        <button
          onClick={() => navigate('/upload-post')}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-full shadow-2xl shadow-amber-500/30 hover:scale-110 transition-all duration-300 z-50 group"
        >
          <Upload size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Share Your Story
          </span>
        </button>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          {[
            { label: 'Total Stories', value: pagination.totalPosts || 0, icon: Camera },
            { label: 'Current Page', value: pagination.currentPage || 1, icon: User },
            { label: 'Total Pages', value: pagination.totalPages || 1, icon: MapPin }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <stat.icon className="text-amber-600" size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPosts;

