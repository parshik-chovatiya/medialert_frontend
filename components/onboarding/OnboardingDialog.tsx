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

import OnboardingWizard from "./OnboardingWizard";
import { onboardingSchema, OnboardingData } from "./schema";
import image1 from "../../public/step1.png";
import image2 from "@/public/step2.png";
import Image from "next/image";
import axiosClient from "@/lib/axios/axiosClient";
import { setOnboardingData } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}


export default function OnboardingDialog({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (data: OnboardingData) => void;
}) {
  const [step, setStep] = useState(0);

  const images = [
    image1,
    image2,
  ];

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
        
      name: "",
      gender: "male",
      birthdate: "",
    },
  });
  const handleSubmit = async (data: any) => {
    try {
      // try onboarding API (works only if registered)
      await axiosClient.post("/onboarding", data);
    } catch {
      // guest user → store locally
      setOnboardingData(data);
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0
          min-w-4xl
          flex
        "
      >
        <VisuallyHidden>
          <DialogTitle>Onboarding</DialogTitle>
        </VisuallyHidden>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] w-full">
          {/* Left */}
          <div className="p-10">
            <OnboardingWizard
              form={form}
              onStepChange={setStep}
              onComplete={() => {
                onComplete(form.getValues());
                onOpenChange(false);
                onSubmit={handleSubmit}
              }}
            />
          </div>

          {/* Right */}
          <div>
            <Image
              src={images[step]}
              alt="Onboarding visual"
              
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
