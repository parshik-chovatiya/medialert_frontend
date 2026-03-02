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
import image1 from "@/public/images/step1.png";
import image2 from "@/public/images/step2.png";

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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Prevent closing via outside click, ESC, or close button
        if (!v) return;
        onOpenChange(v);
      }}
    >
      <DialogContent
        className="p-0 md:min-w-4xl flex w-full max-w-[95vw] sm:max-w-[95vw] md:max-w-4xl rounded-xl"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Onboarding</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] w-full">
          {/* Left - Form */}
          <div className="p-6 sm:p-8 md:p-10">
            <OnboardingWizard
              form={form}
              onStepChange={setStep}
              onComplete={handleComplete}
            />
          </div>

          {/* Right - Image (hidden on mobile) */}
          <div className="hidden md:flex items-center justify-center bg-[#efecfd] rounded-r-lg">
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