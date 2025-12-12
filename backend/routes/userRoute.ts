import { Router } from "express";
import { registerUser, getProfile, updateProfile } from "../controller/userController";
import { verifyJWT } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

// For form-data without files
router.post("/register", ClerkExpressRequireAuth() as any, upload.none(), registerUser);

router.get("/profile", verifyJWT, getProfile);

router.patch("/update-profile", verifyJWT, updateProfile);

export default router;

