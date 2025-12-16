
import { z } from "zod";

export const geoPointSchema = z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.tuple([z.number(), z.number()]).default([0, 0]),
});

export const activityZodSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),

    category: z.string().min(1, "Category is required"),

    date: z.string().or(z.date()).transform((val) => new Date(val)),
    startTime: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : undefined),
    endTime: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : undefined),

    location: geoPointSchema.optional(),

    photos: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),

    gender: z.enum(["Male", "Female"]).optional(),

    price: z.number().nonnegative().default(0),
    foreignerPrice: z.number().nonnegative().optional(),

    maxCapacity: z.number().min(1, "Max capacity must be at least 1"),
});
