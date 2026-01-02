"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { StepProps } from "../types";

export default function DetailsStep({ form }: StepProps) {
  const [open, setOpen] = useState(false);
  const gender = form.watch("gender");
  const birthdate = form.watch("birthdate");
  const dateValue = birthdate ? new Date(birthdate) : undefined;

  const {
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <div className="flex gap-3">
          {["male", "female", "other"].map((g) => (
            <Button
              key={g}
              type="button"
              variant={gender === g ? "default" : "outline"}
              className="flex-1 capitalize"
              onClick={() => form.setValue("gender", g as "male" | "female" | "other")}
            >
              {g}
            </Button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-sm text-destructive">{errors.gender.message}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label>Date of birth</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {dateValue ? dateValue.toLocaleDateString() : "Select date"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              fromYear={1900}
              toYear={new Date().getFullYear()}
              onSelect={(d) => {
                if (!d) return;
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                form.setValue("birthdate", `${y}-${m}-${day}`);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {errors.birthdate && (
          <p className="text-sm text-destructive">{errors.birthdate.message}</p>
        )}
      </div>
    </div>
  );
}