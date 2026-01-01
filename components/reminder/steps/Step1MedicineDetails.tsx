"use client";

import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { Pill, Droplet, Syringe, Thermometer } from "lucide-react";
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
import { MedicineFormData, MedicineType } from "../types";

const MEDICINE_TYPES: MedicineType[] = [
  { value: "tablet", label: "Tablet", icon: Pill, bgColor: "#ff7078" },
  { value: "capsule", label: "Capsule", icon: Thermometer, bgColor: "#fab005" },
  { value: "injection", label: "Injection", icon: Syringe, bgColor: "#228be6" },
  { value: "syrup", label: "Syrup", icon: Droplet, bgColor: "#845ef7" },
];

interface Step1Props {
  form: UseFormReturn<MedicineFormData>;
}

export function Step1MedicineDetails({ form }: Step1Props) {
  const currentType = form.watch("medicine_type");
  const currentIndex = MEDICINE_TYPES.findIndex((t) => t.value === currentType);

  const getRelativePosition = (index: number) => {
    const total = MEDICINE_TYPES.length;
    let diff = index - currentIndex;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    return diff;
  };

  return (
    <div className="space-y-4">
      {/* Icon Carousel */}
      <div className="flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-26 max-w-sm mx-auto">
          {MEDICINE_TYPES.map((type, index) => {
            const Icon = type.icon;
            const position = getRelativePosition(index);
            const isCenter = position === 0;

            return (
              <motion.div
                key={type.value}
                className="absolute left-1/2 top-1/2 -translate-y-1/2"
                initial={false}
                animate={{
                  x: `calc(-50% + ${position * 110}px)`,
                  opacity:
                    Math.abs(position) === 0
                      ? 1
                      : Math.abs(position) === 1
                      ? 0.75
                      : 0,
                  scale: isCenter ? 1 : 0.85,
                }}
                transition={{
                  duration: 0.35,
                  ease: "linear",
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center shadow-sm text-white"
                  style={{
                    width: isCenter ? 96 : 80,
                    height: isCenter ? 96 : 80,
                    opacity: isCenter ? 1 : 0.4,
                    backgroundColor: type.bgColor,
                  }}
                >
                  <Icon className={`${isCenter ? "w-16 h-16" : "w-12 h-12"}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <FormField
          control={form.control}
          name="medicine_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicine Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter medicine name"
                  {...field}
                  className="h-9"
                />
              </FormControl>
              <FormDescription>
                Enter the name of your medicine as prescribed by your doctor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicine_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicine Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select medicine type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEDICINE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}