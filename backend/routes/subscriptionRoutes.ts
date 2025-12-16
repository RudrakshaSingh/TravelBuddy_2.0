import express from "express";

import { createOrder, getPaymentHistory, verifyPayment } from "../controller/subscriptionController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = express.Router();

// Protect routes with authMiddleware to ensure user is logged in
router.post("/create-order", requireProfile, createOrder);
router.post("/verify-payment", requireProfile, verifyPayment);
router.get("/payment-history", requireProfile, getPaymentHistory);

export default router;
