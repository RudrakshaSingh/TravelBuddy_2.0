
import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Calendar, Clock, MapPin, DollarSign, Users, Image as ImageIcon, AlignLeft, Send, X, Plus, Video } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
};

const libraries = ["places"];

export default function CreateActivity() {
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  React.useEffect(() => {
    // Check if user has a subscription
    // Assuming 'Free' is also a valid planType if they went through the process,
    // or if the requirement is STRICTLY paid, change condition to: profile?.planType === 'Free'
    if (profile && !profile.planType) {
      toast.error("Please select a subscription plan to create activities.");
      navigate("/subscription");
    }
  }, [profile, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
    foreignerPrice: "",
    maxCapacity: "",
    gender: "",
    location: null, // { lat, lng }
    photos: [],
    videos: []
  });

  const [photoInput, setPhotoInput] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API,
    libraries,
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Map Click
  const onMapClick = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      },
    }));
  }, []);

  // Handle Photo Add
  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, photoInput] }));
      setPhotoInput("");
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.location) {
        throw new Error("Please select a location on the map");
      }

      // Format data for backend
      // Backend expects:
      // location: { type: "Point", coordinates: [lng, lat] }
      // date: Date object/string
      // startTime/endTime: Date objects/strings

      const payload = {
        ...formData,
        location: {
          type: "Point",
          coordinates: [formData.location.lng, formData.location.lat]
        },
        gender: formData.gender === "Any" ? undefined : formData.gender
      };

      // Mock submit or actual call
      // await axios.post(`${import.meta.env.VITE_API_URL}/api/activities`, payload);

      console.log("Submitting:", payload);
      toast.success("Activity created successfully!");
      // navigate('/activities'); // Redirect after success

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create activity");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["Adventure", "Culture", "Food", "Nightlife", "Sports", "Nature", "Other"];

  // Get current location for map center
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.log(err)
      );
    }
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Activity</h1>
          <p className="text-gray-500 mt-2">Share your adventure with the world.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-indigo-500" />
                Basic Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g., Midnight Cycling in downtown"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                      >
                       <option value="">Select Category</option>
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="maxCapacity"
                        value={formData.maxCapacity}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Max participants"
                      />
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                   <textarea
                     name="description"
                     value={formData.description}
                     onChange={handleChange}
                     rows="4"
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                     placeholder="Describe the activity, what to bring, itinerary..."
                   ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Date & Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                   <input
                     type="time"
                     name="endTime"
                     value={formData.endTime}
                     onChange={handleChange}
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-500" />
                Pricing & Rules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Local)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foreigner Price</label>
                  <div className="relative">
                     <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                     <input
                       type="number"
                       name="foreignerPrice"
                       value={formData.foreignerPrice}
                       onChange={handleChange}
                       min="0"
                       className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                       placeholder="Optional"
                     />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Gender</label>
                   <select
                     name="gender"
                     value={formData.gender}
                     onChange={handleChange}
                     className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                   >
                     <option value="Any">Any</option>
                     <option value="Male">Male Only</option>
                     <option value="Female">Female Only</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Location & Media */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
               <h2 className="text-xl font-semibold flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-indigo-500" />
                 Location
               </h2>
               <div className="h-64 bg-gray-100 rounded-xl overflow-hidden relative">
                 {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={formData.location || center}
                      zoom={13}
                      onClick={onMapClick}
                      options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                      }}
                    >
                      {formData.location && <Marker position={formData.location} />}
                    </GoogleMap>
                 ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading Map...</div>
                 )}
               </div>
               <p className="text-xs text-gray-500 text-center">
                 {formData.location
                   ? `Selected: ${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`
                   : "Tap on the map to select the meeting point."
                 }
               </p>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
               <h2 className="text-xl font-semibold flex items-center gap-2">
                 <ImageIcon className="w-5 h-5 text-indigo-500" />
                 Photos
               </h2>

               <div className="flex gap-2">
                 <input
                   type="text"
                   value={photoInput}
                   onChange={(e) => setPhotoInput(e.target.value)}
                   placeholder="Paste image URL..."
                   className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                 />
                 <button
                   type="button"
                   onClick={handleAddPhoto}
                   className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>

               <div className="space-y-2">
                 {formData.photos.length === 0 && (
                    <div className="text-sm text-gray-400 italic text-center py-4">No photos added yet</div>
                 )}
                 {formData.photos.map((url, idx) => (
                   <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg group">
                     <img src={url} alt="Preview" className="w-10 h-10 rounded object-cover" />
                     <span className="text-xs text-gray-500 truncate flex-1">{url}</span>
                     <button
                       type="button"
                       onClick={() => handleRemovePhoto(idx)}
                       className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
               <h2 className="text-xl font-semibold flex items-center gap-2">
                 <Video className="w-5 h-5 text-indigo-500" />
                 Videos
               </h2>

               <div className="flex gap-2">
                 <input
                   type="text"
                   name="videoInput"
                   placeholder="Paste video URL..."
                   className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       const val = e.target.value;
                       if (val.trim()) {
                         setFormData(prev => ({ ...prev, videos: [...prev.videos, val] }));
                         e.target.value = "";
                       }
                     }
                   }}
                 />
                 <button
                   type="button"
                   onClick={(e) => {
                     const input = e.target.previousSibling;
                     if (input.value.trim()) {
                       setFormData(prev => ({ ...prev, videos: [...prev.videos, input.value] }));
                       input.value = "";
                     }
                   }}
                   className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>

               <div className="space-y-2">
                 {formData.videos.length === 0 && (
                    <div className="text-sm text-gray-400 italic text-center py-4">No videos added yet</div>
                 )}
                 {formData.videos.map((url, idx) => (
                   <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg group">
                     <Video className="w-4 h-4 text-gray-500" />
                     <span className="text-xs text-gray-500 truncate flex-1">{url}</span>
                     <button
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }))}
                       className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
             </div>

             <button
               type="submit"
               disabled={isLoading}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isLoading ? "Creating..." : (
                 <>
                   <Send className="w-5 h-5" />
                   Publish Activity
                 </>
               )}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}
