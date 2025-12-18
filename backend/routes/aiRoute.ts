import { Router } from "express";
import { generateDescription } from "../controller/aifeatureContoller";

const router = Router();

router.post("/generate-description", generateDescription);

export default router;
