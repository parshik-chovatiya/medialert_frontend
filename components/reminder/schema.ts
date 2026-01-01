import { z } from "zod";

export const step1Schema = z.object({
  medicine_name: z.string().min(1, "Medicine name is required"),
  medicine_type: z.string().min(1, "Medicine type is required"),
});

export const step2Schema = z.object({
  dose_count_daily: z.number().min(1, "At least 1 dose is required").max(10),
  notification_methods: z.array(z.string()).min(1, "Select at least one notification method"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone_number: z.string().optional(),
  browser_permission: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.notification_methods.includes("email")) {
      return data.email && data.email.includes("@");
    }
    return true;
  },
  {
    message: "Email is required when email notification is selected",
    path: ["email"],
  }
).refine(
  (data) => {
    if (data.notification_methods.includes("sms")) {
      return data.phone_number && data.phone_number.length >= 10;
    }
    return true;
  },
  {
    message: "Valid phone number is required when SMS notification is selected",
    path: ["phone_number"],
  }
).refine(
  (data) => {
    if (data.notification_methods.includes("push")) {
      return data.browser_permission === true;
    }
    return true;
  },
  {
    message: "Browser permission is required for push notifications",
    path: ["browser_permission"],
  }
);

export const step3Schema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  dose_schedules: z.array(
    z.object({
      dose_number: z.number(),
      amount: z.number().min(1, "Amount must be at least 1"),
      time: z.string().min(1, "Time is required"),
    })
  ).refine(
    (schedules) => {
      const times = schedules.map(s => s.time);
      const uniqueTimes = new Set(times);
      return times.length === uniqueTimes.size;
    },
    {
      message: "Each dose must have a different time",
    }
  ),
});

export const step4Schema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  refill_reminder: z.boolean(),
  refill_threshold: z.number().optional(),
}).refine(
  (data) => {
    if (data.refill_reminder && data.refill_threshold) {
      return data.refill_threshold > 0 && data.refill_threshold < data.quantity;
    }
    return true;
  },
  {
    message: "Threshold must be greater than 0 and less than total quantity",
    path: ["refill_threshold"],
  }
);

export const fullSchema = z.object({
  medicine_name: z.string().min(1, "Medicine name is required"),
  medicine_type: z.string().min(1, "Medicine type is required"),
  dose_count_daily: z.number().min(1).max(10),
  notification_methods: z.array(z.string()).min(1, "select at least one notification method"),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  browser_permission: z.boolean().optional(),
  start_date: z.string().min(1),
  quantity: z.number().min(1),
  refill_reminder: z.boolean(),
  refill_threshold: z.number().optional(),
  dose_schedules: z.array(
    z.object({
      dose_number: z.number(),
      amount: z.number().min(1),
      time: z.string().min(1),
    })
  ),
});