"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../types";

export default function NameStep({ form }: StepProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <Label>Your Name</Label>
      <Input placeholder="Enter your name" {...register("name")} />
      {errors.name && (
        <p className="text-sm text-destructive">{errors.name.message}</p>
      )}
    </div>
  );
}
