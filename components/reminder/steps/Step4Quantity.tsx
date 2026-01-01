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
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
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
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      field.onChange(value);
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
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}