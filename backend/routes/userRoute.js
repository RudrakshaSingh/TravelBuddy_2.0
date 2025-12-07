import { Router } from "express";
import { registerUser } from "../controller/userController.js";
import upload from "../middlewares/multermiddleware.js";

const router = Router();

router.post("/register", upload.none(), registerUser);

export default router;
