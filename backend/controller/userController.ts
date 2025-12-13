import { NextFunction,Request, Response } from "express";

import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { registerUserSchema } from "../validation/registerUserSchema";

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      throw new ApiError(400, "Invalid input data", errors);
    }

    const { clerk_id, mobile, dob, gender, nationality, languages } = parsed.data;
    const inputDob = new Date(dob);

    // Check if user already exists by clerk_id
    const existingUser = await User.findOne({ clerk_id });
    if (existingUser) {
      throw new ApiError(400, "User already registered");
    }

    // Verify Clerk ID matches the authenticated user
    const authUserId = (req as any).auth?.userId;
    if (authUserId && authUserId !== clerk_id) {
       throw new ApiError(403, "Forbidden: Clerk ID mismatch");
    }

    const user = await User.create({
      clerk_id,
      mobile,
      dob: inputDob,
      gender,
      nationality,
      languages: languages as any,
    });

    return res.status(201).json(
      new ApiResponse(201, user, "User registered successfully")
    );
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(new ApiResponse(200, req.user as any, "User Profile Fetched Successfully"));
  }
);

export const updateProfile = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const {
      mobile,
      dob,
      gender,
      travelStyle,
      bio,
      nationality,
      interests,
      socialLinks,
      languages,
      futureDestinations,
    } = req.body;

    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update basic fields if provided
    if (mobile) user.mobile = mobile;
    if (dob) user.dob = new Date(dob);
    if (gender) user.gender = gender;
    if (travelStyle) user.travelStyle = travelStyle;
    if (bio) user.bio = bio;
    if (nationality) user.nationality = nationality;

    // Update Array/Object fields
    if (interests) {
        if (typeof interests === "string") {
            try {
                 user.interests = JSON.parse(interests);
            } catch (e) {
                user.interests = [interests];
            }
        } else {
            user.interests = interests;
        }
    }

     if (futureDestinations) {
        if (typeof futureDestinations === "string") {
            try {
                 user.futureDestinations = JSON.parse(futureDestinations);
            } catch (e) {
                 // handle error
            }
        } else {
             user.futureDestinations = futureDestinations;
        }
    }

    if (socialLinks) {
         if (typeof socialLinks === "string") {
            try {
                 user.socialLinks = JSON.parse(socialLinks);
            } catch (e) {
                 // handle parsing error or ignore
            }
        } else {
             user.socialLinks = { ...user.socialLinks, ...socialLinks };
        }
    }

    if (languages) {
        if (typeof languages === "string") {
             try {
                user.languages = JSON.parse(languages);
             } catch (e) {
                // handle error
             }
        } else {
            user.languages = languages;
        }
    }

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);



