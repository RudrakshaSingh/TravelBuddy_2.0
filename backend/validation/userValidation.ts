// src/validation/user.validation.ts
import { z } from "zod";

import {
  COUNTRIES,
  GENDERS,
  INTERESTS,
  LANGUAGE_LEVELS,
  TRAVEL_STYLES,
} from "../data/enums";

export const languageSchema = z.object({
  name: z.string(),
  level: z.enum(LANGUAGE_LEVELS as [string, ...string[]]).default("Beginner"),
});

export const geoPointSchema = z.object({
  type: z.literal("Point").default("Point"),
  coordinates: z.tuple([z.number(), z.number()]).default([0, 0]),
});

export const futureDestinationSchema = z.object({
  name: z.string(),
  coordinates: z.tuple([z.number(), z.number()]).default([0, 0]),
});

export const userZodSchema = z.object({
  clerk_id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  mobile: z.string().min(10).max(10),

  profilePicture: z.string().optional(),

  dob: z.date(),
  gender: z.enum(GENDERS as [string, ...string[]]),

  travelStyle: z
    .enum(TRAVEL_STYLES as [string, ...string[]])
    .default("Solo"),

  languages: z.array(languageSchema).optional(),

  bio: z.string().default("Not Updated Yet"),

  currentLocation: geoPointSchema.optional(),

  nationality: z.enum(COUNTRIES as [string, ...string[]]).default("Not Specified"),

  futureDestinations: z.array(futureDestinationSchema).optional(),

  interests: z.array(z.enum(INTERESTS as [string, ...string[]])).optional(),

  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional(),

  isOnline: z.boolean().default(false),
  lastSeen: z.date().optional(),
  socketId: z.string().nullable().optional(),

  JoinActivity: z.array(z.string()).optional(),
});
