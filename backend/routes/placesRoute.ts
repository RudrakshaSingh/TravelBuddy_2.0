import { Router } from "express";

import {
    getNearbyHotels,
    getNearbyTouristPlaces,
} from "../controller/placesController";

const router = Router();

// GET /places/hotels?lat=XX&lng=YY&radius=ZZ
router.get("/hotels", getNearbyHotels);

// GET /places/tourist?lat=XX&lng=YY&radius=ZZ
router.get("/tourist", getNearbyTouristPlaces);

export default router;
