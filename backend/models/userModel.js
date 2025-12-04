//user model for backend
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  clerk_id: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  mobile: {
    type: String,
    unique: true,
    min: 10,
    max: 10,
    required: true,
  },

  password: {
    type: String,
    required: true,
    select: false, // don't return password by default
  },

  profilePicture: {
    type: String,
    default:
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740",
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
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
  languages: {
    type: [
      {
        name: String,
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Beginner",
        },
      },
    ],
    required: true,
  },

  bio: {
    type: String,
    default: "Not Updated Yet",
  },

  // ----------- GEOJSON CURRENT LOCATION -----------
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  },
  nationality: {
    type: String,
    required: true,
    default: "Not Specified",
  },

  // ----------- FUTURE DESTINATIONS -----------
  futureDestinations: [
    {
      name: String,
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      startDate: Date,
      endDate: Date,
    },
  ],

  interests: [String],

  socialLinks: {
    instagram: String,
    facebook: String,
    linkedin: String,
  },

  isOnline: {
    type: Boolean,
    default: false,
  },

  lastSeen: {
    type: Date,
    default: Date.now,
  },

  socketId: {
    type: String,
    default: null,
  },

  JoinActivity: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ----------------------------------------------------
// 🔐 PRE-SAVE HASH PASSWORD
// ----------------------------------------------------
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ----------------------------------------------------
// 🔐 COMPARE PASSWORD METHOD
// ----------------------------------------------------
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ----------------------------------------------------
// 🔐 JWT TOKEN GENERATOR
// ----------------------------------------------------
UserSchema.methods.generateJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // you can change validity
  });
};

// ----------------------------------------------------
// 🌍 GEOSPATIAL INDEXES
// ----------------------------------------------------
UserSchema.index({ currentLocation: "2dsphere" });
UserSchema.index({ "futureDestinations.location": "2dsphere" });

export default mongoose.model("User", UserSchema);
