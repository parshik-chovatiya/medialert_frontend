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
              className="flex-1"
              onClick={() => form.setValue("gender", g as any)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* DOB */}
      <div className="space-y-2">
        <Label>Date of birth</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {dateValue ? dateValue.toLocaleDateString() : "Select date"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
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
      </div>
    </div>
  );
}
