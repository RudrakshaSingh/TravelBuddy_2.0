import { z } from "zod";

export const registerUserSchema = z.object({
  clerk_id: z.string().min(1, "Clerk ID is required"),

  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),

  dob: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d <= new Date();
  }, "Invalid or future DOB"),

  gender: z
    .enum(["Male", "Female", "Other"])
    .refine((val) => ["Male", "Female", "Other"].includes(val), {
      message: "Gender must be Male, Female, or Other",
    }),
});

