// src/models/user.model.ts
import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/userInterface";

const geoPointSchema = new Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], default: [0, 0] },
});

const futureDestinationSchema = new Schema({
  name: { type: String },
  coordinates: { type: [Number], default: [0, 0] },
});

const userSchema = new Schema<IUser>({
  clerk_id: { type: String, required: true, unique: true },

  mobile: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },

  dob: { type: Date, required: true },

  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

  travelStyle: {
    type: String,
    enum: [
      "Solo",
      "Group",
      "Adventure",
      "Luxury",
      "Backpacking",
      "Business",
      "Family",
    ],
    default: "Solo",
  },

  languages: [
    {
      name: String,
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
      },
    },
  ],

  bio: { type: String, default: "Not Updated Yet" },

  currentLocation: geoPointSchema,

  nationality: { type: String, default: "Not Specified" },

  futureDestinations: [futureDestinationSchema],

  interests: [String],

  socialLinks: {
    instagram: String,
    facebook: String,
    linkedin: String,
  },

  isOnline: { type: Boolean, default: false },

  lastSeen: { type: Date, default: Date.now },

  socketId: { type: String, default: null },

  JoinActivity: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

  createdAt: { type: Date, default: Date.now },
});

// --------------------------------------
// 🌍 GEO INDEXING
// --------------------------------------
userSchema.index({ currentLocation: "2dsphere" });
userSchema.index({ "futureDestinations.coordinates": "2dsphere" });

export const User = mongoose.model<IUser>("User", userSchema);
