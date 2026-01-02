import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"]),
  birthdate: z.string().min(1, "Birthdate is required"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;