
import { z } from "zod";

export const geoPointSchema = z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.tuple([z.number(), z.number()]).default([0, 0]),
});

export const activityZodSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Description must be atleast 10 characters").optional(),

    category: z.string().min(1, "Category is required"),

    date: z.string().or(z.date()).transform((val) => new Date(val)),
    startTime: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : undefined),
    endDate: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : undefined),

    location: geoPointSchema.optional(),

    photos: z.preprocess((val) => {
        if (typeof val === "string") return [val];
        return val;
    }, z.array(z.string()).optional()),

    videos: z.preprocess((val) => {
        if (typeof val === "string") return [val];
        return val;
    }, z.array(z.string()).optional()),

    gender: z.enum(["Male", "Female", "Any"]).optional(),

    price: z.coerce.number().nonnegative().default(0),
    foreignerPrice: z.coerce.number().nonnegative().optional(),

    maxCapacity: z.coerce.number().min(1, "Max capacity must be at least 1"),
}).superRefine((data, ctx) => {
    const { date, endDate } = data;

    // endDate must be on or after start date
    if (date && endDate && endDate < date) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after start date",
      });
    }
  });
;
