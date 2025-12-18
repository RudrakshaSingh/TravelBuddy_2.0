import { Router } from "express";

import { getProfile, registerUser, updateProfile } from "../controller/userController";
import { requireProfile,verifyClerk } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// For form-data without files - only needs Clerk auth (no profile yet)
router.post("/register", verifyClerk, upload.none(), registerUser);

// These routes require full auth (Clerk + MongoDB profile)
router.get("/profile", requireProfile, getProfile);
router.patch("/update-profile", requireProfile, upload.single("coverImage"), updateProfile);

export default router;

