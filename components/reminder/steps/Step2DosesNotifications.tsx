"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAppSelector } from "@/store/hooks";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicineFormData, NotificationOption } from "../types";

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Browser Notification" },
];

const COUNTRY_CODES = [
  { value: "+1", label: "+1", },
  { value: "+44", label: "+44" },
  { value: "+91", label: "+91" },
  { value: "+86", label: "+86" },
  { value: "+81", label: "+81" },
  { value: "+49", label: "+49" },
  { value: "+33", label: "+33" },
  { value: "+61", label: "+61" },
];

interface Step2Props {
  form: UseFormReturn<MedicineFormData>;
}

export function Step2DosesNotifications({ form }: Step2Props) {
  // Get user data from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const userEmail = user?.email || "";

  const notificationMethods = form.watch("notification_methods") || [];
  const countryCode = form.watch("country_code") || "+91";
  const mobileNumber = form.watch("mobile_number") || "";

  // Set email from store when component mounts or user changes
  useEffect(() => {
    if (userEmail) {
      form.setValue("email", userEmail);
    }
  }, [userEmail, form]);

  const [pushError, setPushError] = useState<string | null>(null);

  const toggleNotification = async (value: string) => {
    const current = form.getValues("notification_methods") || [];

    // Deselecting — always allow
    if (current.includes(value)) {
      form.setValue(
        "notification_methods",
        current.filter((v) => v !== value)
      );
      if (value === "push") {
        form.setValue("browser_permission", false);
        setPushError(null);
      }
      form.trigger("notification_methods");
      return;
    }

    // Selecting "push" — check / request permission first
    if (value === "push") {
      setPushError(null);

      if (!("Notification" in window)) {
        setPushError("Browser notifications are not supported in this browser.");
        return;
      }

      let permission = Notification.permission;

      if (permission === "denied") {
        setPushError(
          "Notification permission is blocked. Please enable it in your browser settings."
        );
        return;
      }

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setPushError(
          "Notification permission was not granted. Please allow notifications to use this feature."
        );
        return;
      }

      // Permission is granted — select and mark
      form.setValue("browser_permission", true);
    }

    form.setValue("notification_methods", [...current, value]);
    form.trigger("notification_methods");
  };

  // Update phone_number whenever country code or mobile number changes
  const updatePhoneNumber = (code: string, number: string) => {
    if (number && number.trim().length > 0) {
      form.setValue("phone_number", `${code}${number}`);
    } else {
      form.setValue("phone_number", "");
    }
  };

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="dose_count_daily"
        render={({ field }) => (
          <FormItem>
            <FormDescription>
              Select how many times you need to take this medicine each day
            </FormDescription>
            <Select
              value={field.value?.toString()}
              onValueChange={(v) => {
                const doseCount = Number(v);
                field.onChange(doseCount);

                // Update dose schedules
                const schedules = Array.from({ length: doseCount }, (_, i) => ({
                  dose_number: i + 1,
                  amount: 1,
                  time: "",
                }));
                form.setValue("dose_schedules", schedules);
              }}
            >
              <FormControl>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select doses per day" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 10 }).map((_, i) => (
                  <SelectItem key={i} value={`${i + 1}`}>
                    {i + 1} {i === 0 ? "time" : "times"} Daily
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notification_methods"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notification Methods</FormLabel>
            <FormDescription>Select notification methods</FormDescription>
            <div className="w-full flex gap-2 overflow-x-auto">
              {NOTIFICATION_OPTIONS.map((option) => {
                const isSelected = notificationMethods.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleNotification(option.value)}
                    className={`px-4 py-1 rounded-lg border-2 transition-all font-medium text-sm whitespace-nowrap flex-shrink-0 ${isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <FormMessage />
            {pushError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {pushError}
              </p>
            )}
          </FormItem>
        )}
      />

      {/* Conditional Fields */}
      {notificationMethods.length > 0 && (
        <div className="space-y-4 overflow-y-scroll max-h-30 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
          {notificationMethods.includes("email") && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      value={field.value || userEmail}
                      disabled
                      className="bg-muted cursor-not-allowed h-9"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Reminders will be sent to this email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {notificationMethods.includes("sms") && (
            <div className="space-y-2">
              <FormLabel>Mobile Number</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="country_code"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          updatePhoneNumber(v, mobileNumber);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-32 h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRY_CODES.map((code) => (
                            <SelectItem key={code.value} value={code.value}>
                              <span className="flex items-center gap-2">
                                <span>{code.flag}</span>
                                <span>{code.value}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(value);
                            updatePhoneNumber(countryCode, value);
                          }}
                          className="h-9"
                          maxLength={15}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription>
                      Combined number: {field.value || "Not set"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {notificationMethods.includes("push") && (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Browser notification permission granted
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 