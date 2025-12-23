import { Router } from "express";
import { generateDescription, generatePlan, generatePostCaption } from "../controller/aifeatureContoller";

const router = Router();

router.post("/generate-description", generateDescription);
router.post("/plan-trip", generatePlan);
router.post("/generate-post-caption", generatePostCaption);

export default router;
