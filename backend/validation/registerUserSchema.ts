import { z } from "zod";

import { COUNTRIES, GENDERS, INTERESTS, LANGUAGE_LEVELS, LANGUAGES } from "../data/enums";

export const registerUserSchema = z.object({
  clerk_id: z.string().min(1, "Clerk ID is required"),

  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),

  dob: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d <= new Date();
  }, "Invalid or future DOB"),

  gender: z.enum(GENDERS as [string, ...string[]]),

  nationality: z.enum(COUNTRIES as [string, ...string[]]),

  languages: z
    .array(
      z.object({
        name: z.enum(LANGUAGES as [string, ...string[]]),
        level: z.enum(LANGUAGE_LEVELS as [string, ...string[]]),
      })
    )
    .min(1, "At least one language is required"),
  
  interests: z
    .array(z.enum(INTERESTS as [string, ...string[]]))
    .optional(),

  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),

  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

