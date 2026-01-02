"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import NameStep from "./steps/NameStep";
import DetailsStep from "./steps/DetailsStep";
import { UseFormReturn } from "react-hook-form";
import { OnboardingData } from "./schema";

interface OnboardingWizardProps {
  form: UseFormReturn<OnboardingData>;
  onStepChange?: (step: number) => void;
  onComplete: () => void;
}

export default function OnboardingWizard({
  form,
  onStepChange,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0);

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    onStepChange?.(newStep);
  };

  const next = async () => {
    // Validate current step
    if (step === 0) {
      const isValid = await form.trigger("name");
      if (!isValid) return;
    }

    if (step === 1) {
      const isValid = await form.trigger(["gender", "birthdate"]);
      if (!isValid) return;
    }

    // If on last step, submit
    if (step === 1) {
      onComplete();
    } else {
      handleStepChange(step + 1);
    }
  };

  const previous = () => {
    if (step > 0) {
      handleStepChange(step - 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">
        {step === 0 ? "Your Name" : "Personal Details"}
      </h1>

      {/* Step Content */}
      <div className="flex-1">
        {step === 0 && <NameStep form={form} />}
        {step === 1 && <DetailsStep form={form} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-auto pt-10">
        {step > 0 ? (
          <Button variant="outline" onClick={previous} type="button">
            Previous
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={next} type="button">
          {step === 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}