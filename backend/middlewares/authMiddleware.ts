import { Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: (options?: { template?: string }) => Promise<string | null>;
        claims?: any;
      };
    }
  }
}

// Middleware to populate req.user after Clerk has verified the token
const populateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.auth?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized - No Clerk User ID");
  }

  const user = await User.findOne({ clerk_id: userId });

  if (!user) {
    throw new ApiError(404, "User not found in database");
  }

  req.user = user;
  next();
});

// Export as an array of middlewares
// 1. Verify Clerk Token
// 2. Populate User from DB
export const verifyJWT = [
  ClerkExpressRequireAuth(),
  populateUser
] as any;
