import { Router } from "express";
import { registerUser, getProfile } from "../controller/userController";
import { verifyJWT } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// For form-data without files
router.post("/register", upload.none(), registerUser);

router.get("/profile", verifyJWT, getProfile);

export default router;
