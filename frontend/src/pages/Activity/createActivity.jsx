
import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { Calendar, Clock, MapPin, DollarSign, Users, Image as ImageIcon, AlignLeft, Send, X, Plus, Video, Search, Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const newLocation = { lat, lng };
        setFormData((prev) => ({
             ...prev,
             location: newLocation
        }));
        setCenter(newLocation);
      } else {
        toast.error("Please select a location from the dropdown");
      }
    }
  };

  React.useEffect(() => {
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

  const fileInputRef = useRef(null);

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
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotos = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => {
      const updatedPhotos = [...prev.photos];
      URL.revokeObjectURL(updatedPhotos[index].preview);
      updatedPhotos.splice(index, 1);
      return { ...prev, photos: updatedPhotos };
    });
  };

  // Voice Recording Logic
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast("Listening...", { icon: '🎙️' });
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
         setFormData(prev => ({
           ...prev,
           description: prev.description + (prev.description ? " " : "") + finalTranscript
         }));
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };


    window.recognitionInstance = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (window.recognitionInstance) {
      window.recognitionInstance.stop();
      setIsRecording(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.location) {
        throw new Error("Please select a location on the map");
      }

      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("category", formData.category);
      formPayload.append("date", formData.date);
      formPayload.append("startTime", formData.startTime);
      formPayload.append("endTime", formData.endTime || "");
      formPayload.append("price", formData.price.toString());
      formPayload.append("foreignerPrice", (formData.foreignerPrice || "").toString());
      formPayload.append("maxCapacity", formData.maxCapacity.toString());
      if (formData.gender !== "Any") {
        formPayload.append("gender", formData.gender);
      }

      formPayload.append("location", JSON.stringify({
         type: "Point",
         coordinates: [formData.location.lng, formData.location.lat]
      }));

      // Append photos
      formData.photos.forEach(p => {
        if (p.file) {
            formPayload.append("photos", p.file);
        }
      });

      // Append videos (URLs)
      formData.videos.forEach(v => {
         formPayload.append("videos", v);
      });

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/activities`, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });

      console.log("Response:", response.data);
      toast.success("Activity created successfully!");
      // navigate('/activities');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to create activity");
    } finally {
      setIsLoading(false);
    }
  };

  // AI Description Generation
  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.category) {
      toast.error("Please enter Title and Category first to generate description.");
      return;
    }

    setIsGenerating(true);
    try {


      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/api-description`,
        {
          title: formData.title,
          category: formData.category
        }
      );

      const generatedText = response.data.data;
      console.log("Generated Text:", generatedText);

      if (generatedText) {
        setFormData(prev => ({
          ...prev,
          description: generatedText
        }));
        toast.success("Description generated manually!");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(error.response?.data?.message || "Failed to generate description");
    } finally {
      setIsGenerating(false);
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
                   <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isGenerating ? "Generating..." : "Generate with AI"}
                      </button>
                   </div>
                   <div className="relative">
                     <textarea
                       name="description"
                       value={formData.description}
                       onChange={handleChange}
                       rows="4"
                       className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                       placeholder="Describe the activity, what to bring, itinerary..."
                     ></textarea>
                     <button
                       type="button"
                       onClick={toggleRecording}
                       className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                         isRecording
                           ? "bg-red-100 text-red-600 animate-pulse"
                           : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                       }`}
                       title={isRecording ? "Stop Recording" : "Start Voice Input"}
                     >
                       {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                     </button>
                   </div>
                   {isRecording && <p className="text-xs text-red-500 mt-1 animate-pulse">Recording... Speak now</p>}
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
               {isLoaded && (
                  <div className="mb-4">
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for a place..."
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      </div>
                    </Autocomplete>
                  </div>
               )}
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

               <div className="space-y-4">
                 <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                 >
                   <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                   />
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                   </div>
                   <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
                   <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {formData.photos.map((photo, idx) => (
                     <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200">
                       <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                       <button
                         type="button"
                         onClick={() => handleRemovePhoto(idx)}
                         className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-sm"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
                 {formData.photos.length === 0 && (
                    <div className="text-sm text-gray-400 italic text-center">No photos selected</div>
                 )}
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
