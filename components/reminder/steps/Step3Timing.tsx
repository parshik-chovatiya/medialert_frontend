"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datePicker";
import { MedicineFormData } from "../types";

interface Step3Props {
  form: UseFormReturn<MedicineFormData>;
}

export function Step3Timing({ form }: Step3Props) {
  const doseSchedules = form.watch("dose_schedules") || [];
  const medicineType = form.watch("medicine_type");

  const getMedicineTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      tablet: "tablet",
      capsule: "capsule",
      injection: "injection",
      syrup: "ml",
    };
    return types[type] || type;
  };

  const checkDuplicateTimes = () => {
    const times = doseSchedules.map((s) => s.time).filter((t) => t.length > 0);
    const uniqueTimes = new Set(times);
    return times.length !== uniqueTimes.size;
  };

  const getDuplicateTimeIndices = () => {
    const duplicates: number[] = [];
    const timeMap: { [key: string]: number[] } = {};

    doseSchedules.forEach((schedule, index) => {
      const time = schedule.time;
      if (time.length > 0) {
        if (!timeMap[time]) {
          timeMap[time] = [];
        }
        timeMap[time].push(index);
      }
    });

    Object.values(timeMap).forEach((indices) => {
      if (indices.length > 1) {
        duplicates.push(...indices);
      }
    });

    return duplicates;
  };

  const duplicateIndices = getDuplicateTimeIndices();

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 whitespace-nowrap">
            <FormLabel>Start Date :</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ? new Date(field.value + "T00:00:00") : undefined}
                minDate={new Date()}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    field.onChange(`${year}-${month}-${day}`);
                  } else {
                    field.onChange("");
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2.5 max-h-[250px] pr-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
        {doseSchedules.map((schedule, index) => (
          <div key={index} className="border rounded-lg p-3 bg-primary/2 space-y-2">
            <p className="text-sm font-medium text-gray-700">Dose {index + 1}</p>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`dose_schedules.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-600">Amount</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full h-8 text-sm bg-white"
                          min="1"
                        />
                      </FormControl>
                      <span className="text-xs text-gray-600 whitespace-nowrap uppercase">
                        {getMedicineTypeLabel(medicineType)}
                        {field.value > 1 ? "s" : ""}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`dose_schedules.${index}.time`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-600">Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setTimeout(() => form.trigger("dose_schedules"), 100);
                        }}
                        className={`w-full h-8 text-sm bg-white ${
                          duplicateIndices.includes(index) ? "border-red-500" : ""
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {checkDuplicateTimes() && (
        <p className="text-xs text-red-500">Each dose must have a different time</p>
      )}
    </div>
  );
}