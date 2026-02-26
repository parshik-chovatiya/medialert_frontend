"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MedicineFormData } from "../types";

interface Step4Props {
  form: UseFormReturn<MedicineFormData>;
}

export function Step4Quantity({ form }: Step4Props) {
  const refillReminder = form.watch("refill_reminder");
  const quantity = form.watch("quantity");
  const refillThreshold = form.watch("refill_threshold");

  // Real-time validation: refill threshold must be less than quantity
  const refillError =
    refillReminder && refillThreshold !== undefined && quantity !== undefined
      ? refillThreshold <= 0
        ? "Refill threshold must be greater than 0"
        : refillThreshold >= quantity
          ? `Refill threshold must be less than total quantity (${quantity})`
          : null
      : null;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Pills/Tablets</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter total quantity"
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // If empty, set to undefined
                  if (value === "" || value === null) {
                    field.onChange(undefined);
                  } else {
                    // Convert to number and ensure no leading zeros
                    const numValue = Number(value);
                    field.onChange(numValue);
                  }
                }}
                className="h-9"
                min="1"
              />
            </FormControl>
            <FormDescription>
              Enter the total quantity of medicine you have
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <FormField
          control={form.control}
          name="refill_reminder"
          render={({ field }) => (
            <FormItem className="flex justify-between items-center py-0.5">
              <FormLabel className="text-sm font-medium">
                Enable refill reminder
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue("refill_threshold", undefined);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {refillReminder && (
          <FormField
            control={form.control}
            name="refill_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remind me when stock reaches</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter threshold quantity"
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      // If empty, set to undefined
                      if (value === "" || value === null) {
                        field.onChange(undefined);
                      } else {
                        // Convert to number and ensure no leading zeros
                        const numValue = Number(value);
                        field.onChange(numValue);
                      }
                    }}
                    className="h-9"
                    min="1"
                  />
                </FormControl>
                <FormDescription>
                  We will remind you to refill when your medicine stock reaches this
                  level
                  {quantity && ` (must be less than ${quantity})`}
                </FormDescription>
                {refillError && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {refillError}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}