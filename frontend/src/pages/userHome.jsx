import { useUser } from "@clerk/clerk-react";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Shield,
  Star,
  Users,
  Globe,
  Activity,
  Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import CurrentLocationMap from '../components/currentLocation';

const heroSlides = [
  {
    title: 'Explore the Unseen World',
    subtitle: 'Connect with local travelers, join exclusive activities, and discover hidden gems.',
    location: 'Bali • Indonesia',
    travelers: '1.2k travelers nearby',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2400&q=80'
  },
  {
    title: 'Adventure Awaits You',
    subtitle: 'From mountain trekking to city nightlife, find your perfect travel companion.',
    location: 'Swiss Alps • Switzerland',
    travelers: '850 active adventurers',
    image: 'https://images.unsplash.com/photo-1491555103987-179286318693?auto=format&fit=crop&w=2400&q=80'
  },
  {
    title: 'Culture & Cuisine',
    subtitle: 'Immerse yourself in local traditions and taste authentic flavors with new friends.',
    location: 'Kyoto • Japan',
    travelers: '2.5k foodies exploring',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2400&q=80'
  }
];

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Find Companions",
    desc: "Match with travelers who share your vibe and interests.",
    color: "from-orange-400 to-pink-500"
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Join Activities",
    desc: "Participate in curated local events and adventures.",
    color: "from-blue-400 to-indigo-500"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Safe Travel",
    desc: "Verified profiles and secure community guidelines.",
    color: "from-green-400 to-emerald-500"
  }
];

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide((prev) => (prev + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, []);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Globe className="w-16 h-16 text-indigo-600 mx-auto animate-spin-slow" />
          <h1 className="text-4xl font-bold text-gray-900">Welcome to TravelBuddy</h1>
          <p className="text-gray-500 text-lg">Your journey begins with a secure login.</p>
          <button
             onClick={() => navigate('/sign-in')}
             className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">

      {/* Immersive Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[10000ms] ease-linear"
              style={{ backgroundImage: `url(${slide.image})`, transform: index === activeSlide ? 'scale(110%)' : 'scale(100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>#1 Travel Community App</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              {heroSlides[activeSlide].title}
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              {heroSlides[activeSlide].subtitle}
            </p>

            <div className="flex gap-4">
              <button onClick={() => navigate('/map')} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-orange-500/40 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                Start Exploring <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                <Play className="w-5 h-5" /> Watch Video
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span className="font-medium">{heroSlides[activeSlide].location}</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{heroSlides[activeSlide].travelers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? 'w-10 bg-white' : 'w-3 bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative -mt-20 z-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Map Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-block p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              See Who's Traveling <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Near You</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our real-time interactive map shows you nearby travelers, trending hotspots, and exclusive local events. Never travel alone again.
            </p>
            <div className="flex gap-8">
              <div>
                <h4 className="text-3xl font-bold text-gray-900">50k+</h4>
                <p className="text-gray-500">Active Travelers</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-gray-900">120+</h4>
                <p className="text-gray-500">Countries</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-gray-900">4.9</h4>
                <p className="text-gray-500">User Rating</p>
              </div>
            </div>
            <button onClick={() => navigate('/map')} className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center gap-2">
              Open Live Map <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-100">
               <div className="h-[500px] w-full bg-gray-200 relative">
                  {currentLocation ? (
                    <CurrentLocationMap lat={currentLocation.lat} lng={currentLocation.lng} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>Loading Location...</p>
                      </div>
                    </div>
                  )}
                  {/* Floating UI Elements on Map */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg max-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-bold text-gray-700">LIVE UPDATES</span>
                    </div>
                    <p className="text-xs text-gray-500">14 travelers joined activities nearby in the last hour.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/20 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
           <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
           <p className="text-xl text-gray-400 mb-10">Join thousands of travelers creating memories and exploring the world together.</p>
           <button onClick={() => navigate('/create-activity')} className="px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
             Create Your First Activity
           </button>
        </div>
      </section>

    </div>
  );
}

export default HomePage;