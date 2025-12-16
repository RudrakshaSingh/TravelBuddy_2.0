import mongoose, { Document, Schema } from "mongoose";

import { SUBSCRIPTION_PLANS } from "../data/enums";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  cfOrderId: string; // Cashfree order ID
  paymentSessionId?: string;
  planType: (typeof SUBSCRIPTION_PLANS)[number];
  amount: number;
  currency: string;
  orderStatus: string; // ACTIVE, PAID, EXPIRED, etc.
  paymentStatus?: string; // SUCCESS, FAILED, PENDING
  paymentMethod?: string;
  paymentTime?: Date;
  cfPaymentId?: string; // Cashfree payment ID
  bankReference?: string;
  rawResponse?: object; // Store full Cashfree response for debugging
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    cfOrderId: { type: String },
    paymentSessionId: { type: String },
    planType: {
      type: String,
      enum: SUBSCRIPTION_PLANS,
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    orderStatus: { type: String, default: "ACTIVE" },
    paymentStatus: { type: String },
    paymentMethod: { type: String },
    paymentTime: { type: Date },
    cfPaymentId: { type: String },
    bankReference: { type: String },
    rawResponse: { type: Object },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
