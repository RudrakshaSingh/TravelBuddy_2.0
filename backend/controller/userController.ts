import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel";

import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import { registerUserSchema } from "../validation/registerUserSchema";

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      throw new ApiError(400, "Invalid input data", errors);
    }

    const { clerk_id, fullName, email, mobile, dob, gender } = parsed.data;
    const inputDob = new Date(dob);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }

    const user = await User.create({
      clerk_id,
      fullName: fullName.trim(),
      email,
      mobile,
      dob: inputDob,
      gender,
    });

    const token = user.generateJwtToken();

    return res
      .status(201)
      .json(
        new ApiResponse(201, { user, token }, "User registered successfully")
      );
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(new ApiResponse(200, req.user as any, "User Profile Fetched Successfully"));
  }
);
