import { z } from "zod";

export const onboardingSchema = z.object({
  full_name: z.string().min(2),
  age: z.number().min(1),
  gender: z.enum(["male", "female", "other"]),
  timezone: z.string(),
});

export type OnboardingForm = z.infer<typeof onboardingSchema>;
