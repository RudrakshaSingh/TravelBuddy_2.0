import {
  BookOpen,
  Calendar,
  Camera,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Share2,
  TrendingUp,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Dummy article data
const dummyArticles = [
  {
    id: 1,
    title: "10 Hidden Gems in Southeast Asia You Must Visit",
    excerpt: "Discover the lesser-known paradises that seasoned travelers are raving about. From secret beaches to mountain villages, these destinations will take your breath away.",
    author: "Sarah Chen",
    authorAvatar: "https://i.pravatar.cc/150?img=1",
    coverImage: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    category: "Destination Guide",
    readTime: "8 min read",
    publishedDate: "2025-01-15",
    views: 2345,
    likes: 189,
    comments: 42,
    featured: true
  },
  {
    id: 2,
    title: "Solo Female Travel: Safety Tips and Empowering Stories",
    excerpt: "Hear from women who've traveled the world solo and learn essential safety tips for your own adventure. Empower yourself to explore without fear.",
    author: "Emma Rodriguez",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    category: "Travel Tips",
    readTime: "12 min read",
    publishedDate: "2025-01-14",
    views: 3421,
    likes: 267,
    comments: 58,
    featured: true
  },
  {
    id: 3,
    title: "Budget Travel Hacks: See the World for Less",
    excerpt: "Travel doesn't have to break the bank. Learn how to find cheap flights, affordable accommodations, and eat like a local without spending a fortune.",
    author: "Mike Johnson",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    category: "Budget Travel",
    readTime: "6 min read",
    publishedDate: "2025-01-13",
    views: 1876,
    likes: 134,
    comments: 31,
    featured: false
  },
  {
    id: 4,
    title: "The Ultimate Guide to Digital Nomad Life",
    excerpt: "Everything you need to know about working remotely while traveling the world. From visa requirements to best coworking spaces.",
    author: "Alex Kumar",
    authorAvatar: "https://i.pravatar.cc/150?img=8",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    category: "Digital Nomad",
    readTime: "15 min read",
    publishedDate: "2025-01-12",
    views: 4521,
    likes: 392,
    comments: 87,
    featured: true
  },
  {
    id: 5,
    title: "Sustainable Travel: How to Reduce Your Carbon Footprint",
    excerpt: "Make a positive impact while exploring the world. Practical tips for eco-friendly travel that actually makes a difference.",
    author: "Olivia Green",
    authorAvatar: "https://i.pravatar.cc/150?img=9",
    coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    category: "Sustainable Travel",
    readTime: "10 min read",
    publishedDate: "2025-01-11",
    views: 2198,
    likes: 201,
    comments: 45,
    featured: false
  },
  {
    id: 6,
    title: "Best Street Food Destinations Around the Globe",
    excerpt: "From Bangkok's night markets to Mexico City's tacos, discover where to find the world's most delicious and authentic street food.",
    author: "David Lee",
    authorAvatar: "https://i.pravatar.cc/150?img=14",
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    category: "Food & Culture",
    readTime: "7 min read",
    publishedDate: "2025-01-10",
    views: 3156,
    likes: 287,
    comments: 63,
    featured: false
  },
  {
    id: 7,
    title: "Photography Tips for Capturing Perfect Travel Moments",
    excerpt: "Transform your travel photos from snapshots to stunning memories. Expert tips from professional travel photographers.",
    author: "Lisa Park",
    authorAvatar: "https://i.pravatar.cc/150?img=20",
    coverImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
    category: "Photography",
    readTime: "9 min read",
    publishedDate: "2025-01-09",
    views: 1987,
    likes: 156,
    comments: 28,
    featured: false
  },
  {
    id: 8,
    title: "Winter Adventures: Top Ski Resorts in the Alps",
    excerpt: "Experience the thrill of Alpine skiing at these world-class resorts. From beginner slopes to expert runs, find your perfect winter escape.",
    author: "Thomas Mueller",
    authorAvatar: "https://i.pravatar.cc/150?img=15",
    coverImage: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    category: "Adventure",
    readTime: "11 min read",
    publishedDate: "2025-01-08",
    views: 2765,
    likes: 234,
    comments: 51,
    featured: false
  }
];

const categories = ["All", "Destination Guide", "Travel Tips", "Budget Travel", "Digital Nomad", "Sustainable Travel", "Food & Culture", "Photography", "Adventure"];

function ReadArticle() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter articles based on search and category
  const filteredArticles = dummyArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <BookOpen className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Travel Articles</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Explore Stories & Guides
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover inspiring travel stories, expert guides, and tips from travelers around the world
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or content..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-amber-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  {/* Cover Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={article.authorAvatar}
                        alt={article.author}
                        className="w-10 h-10 rounded-full ring-2 ring-amber-100"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{article.author}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(article.publishedDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={16} className="text-blue-500" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={16} className="text-red-500" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={16} className="text-green-500" />
                        {article.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-amber-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={article.authorAvatar}
                        alt={article.author}
                        className="w-8 h-8 rounded-full ring-2 ring-amber-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{article.author}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(article.publishedDate)}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={14} className="text-blue-500" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} className="text-red-500" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-green-500" />
                        {article.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="text-amber-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Articles', value: dummyArticles.length, icon: BookOpen },
            { label: 'Total Views', value: dummyArticles.reduce((sum, a) => sum + a.views, 0).toLocaleString(), icon: Eye },
            { label: 'Total Likes', value: dummyArticles.reduce((sum, a) => sum + a.likes, 0).toLocaleString(), icon: Heart },
            { label: 'Total Comments', value: dummyArticles.reduce((sum, a) => sum + a.comments, 0), icon: MessageCircle }
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

export default ReadArticle;
