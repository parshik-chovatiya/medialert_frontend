"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import OnboardingWizard from "./OnboardingWizard";
import { onboardingSchema, OnboardingData } from "./schema";
import image1 from "@/public/step1.png";
import image2 from "@/public/step2.png";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingDialog({
  open,
  onOpenChange,
  onComplete,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0);

  const images = [image1, image2];

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      gender: "male",
      birthdate: "",
    },
  });

  const handleComplete = () => {
    const data = form.getValues();
    onComplete(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 min-w-4xl flex">
        <VisuallyHidden>
          <DialogTitle>Onboarding</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] w-full">
          {/* Left - Form */}
          <div className="p-10">
            <OnboardingWizard
              form={form}
              onStepChange={setStep}
              onComplete={handleComplete}
            />
          </div>

          {/* Right - Image */}
          <div className="flex items-center justify-center">
            <Image
              src={images[step]}
              alt="Onboarding visual"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}