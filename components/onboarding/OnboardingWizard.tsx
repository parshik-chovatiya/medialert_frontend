"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import NameStep from "./steps/NameStep";
import DetailsStep from "./steps/DetailsStep";
import { UseFormReturn } from "react-hook-form";
import { OnboardingData } from "./schema";

export default function OnboardingWizard({
  form,
  onComplete,
}: {
  form: UseFormReturn<OnboardingData>;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  const next = async () => {
    if (step === 0 && !(await form.trigger("name"))) return;
    if (step === 1 && !(await form.trigger(["gender", "birthdate"]))) return;

    step === 1 ? onComplete() : setStep(step + 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-6">
        {step === 0 ? "Your Name" : "Personal Details"}
      </h1>

      {step === 0 && <NameStep form={form} />}
      {step === 1 && <DetailsStep form={form} />}

      <div className="flex justify-between mt-auto pt-10">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={next}>{step === 1 ? "Submit" : "Next"}</Button>
      </div>
    </div>
  );
}
