import { NextFunction, Request, Response } from "express";

import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_API;
const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

interface PlaceResult {
    place_id: string;
    name: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    vicinity?: string;
    types?: string[];
    opening_hours?: {
        open_now?: boolean;
    };
    international_phone_number?: string;
    business_status?: string;
}

// Helper to get photo URL from photo reference
const getPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
    return `${PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

// Helper to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

// Helper to transform places response
const transformPlaceResult = (
    place: PlaceResult,
    userLat: number,
    userLng: number
) => {
    // Get the photo URL (Nearby Search API only returns 1 photo)
    const image = place.photos?.[0]
        ? getPhotoUrl(place.photos[0].photo_reference, 800)
        : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=300";

    return {
        _id: place.place_id,
        name: place.name,
        image,
        currentLocation: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        },
        distanceKm: calculateDistance(
            userLat,
            userLng,
            place.geometry.location.lat,
            place.geometry.location.lng
        ),
        rating: place.rating || 0,
        vicinity: place.vicinity || "",
        types: place.types || [],
        isOpen: place.opening_hours?.open_now,
        totalRatings: place.user_ratings_total || 0,
        phoneNumber: place.international_phone_number || "",
        businessStatus: place.business_status || "UNKNOWN",
    };
};

// Get Nearby Hotels
export const getNearbyHotels = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000" } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        const url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=lodging&key=${GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();
        

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            throw new ApiError(
                500,
                `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
            );
        }

        const hotels = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        // Add amenities from types
        const hotelsWithAmenities = hotels.map((hotel: ReturnType<typeof transformPlaceResult>) => ({
            ...hotel,
            amenities: hotel.types
                ?.filter((t: string) => !["lodging", "point_of_interest", "establishment"].includes(t))
                .slice(0, 3)
                .map((t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())) || [],
        }));
        
        return res
            .status(200)
            .json(new ApiResponse(200, hotelsWithAmenities, "Nearby hotels fetched successfully"));
    }
);

// Get Nearby Tourist Places
export const getNearbyTouristPlaces = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000" } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        const url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`;
  
        
        const response = await fetch(url);
        const data = await response.json();

        console.log("dd",data);
        

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            throw new ApiError(
                500,
                `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
            );
        }

        const places = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        // Add category and entry fee estimation
        const placesWithDetails = places.map((place: ReturnType<typeof transformPlaceResult>) => {
            // Determine category from types
            let category = "Attraction";
            if (place.types?.some((t: string) => ["museum", "art_gallery"].includes(t))) {
                category = "Culture";
            } else if (place.types?.some((t: string) => ["park", "natural_feature"].includes(t))) {
                category = "Nature";
            } else if (place.types?.some((t: string) => ["church", "hindu_temple", "mosque", "synagogue", "place_of_worship"].includes(t))) {
                category = "Religious";
            } else if (place.types?.some((t: string) => ["point_of_interest", "establishment"].includes(t))) {
                category = "Historical";
            }

            return {
                ...place,
                category,
                openTime: place.isOpen !== undefined
                    ? (place.isOpen ? "Open Now" : "Currently Closed")
                    : "Hours Vary",
            };
        });

        return res
            .status(200)
            .json(new ApiResponse(200, placesWithDetails, "Nearby tourist places fetched successfully"));
    }
);
