"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Pill,
  Calendar,
  Clock,
  Package,
  CheckCircle2,
} from "lucide-react";
import { MedicineFormData } from "./types";
import { step1Schema, step2Schema, step3Schema, step4Schema, fullSchema } from "./schema";
import { Step1MedicineDetails } from "./steps/Step1MedicineDetails";
import { Step2DosesNotifications } from "./steps/Step2DosesNotifications";
import { Step3Timing } from "./steps/Step3Timing";
import { Step4Quantity } from "./steps/Step4Quantity";
import { Step5Review } from "./steps/Step5Review";

const TOTAL_STEPS = 5;

const STEP_IMAGES = {
  1: "/step1.png",
  2: "/step2.png",
  3: "/step3.png",
  4: "/step4.png",
  5: "/step5.png",
};

interface ReminderWizardProps {
  onSubmit?: (data: any) => void;
}

export default function ReminderWizard({ onSubmit: onSubmitProp }: ReminderWizardProps) {
  const [step, setStep] = useState(1);

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      medicine_name: "",
      medicine_type: "tablet",
      dose_count_daily: 1,
      notification_methods: ["email"],
      email: "",
      country_code: "+91",
      mobile_number: "",
      phone_number: "",
      browser_permission: false,
      start_date: "",
      quantity: 0,
      refill_reminder: false,
      refill_threshold: undefined,
      dose_schedules: [
        {
          dose_number: 1,
          amount: 1,
          time: "",
        },
      ],
    },
  });

  useEffect(() => {
    // Replace with actual store email fetch
    const userEmail = "JohnDeo@gmail.com"; // Get from your store
    form.setValue("email", userEmail);
  }, [form]);

  const validateCurrentStep = async () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = await form.trigger(["medicine_name", "medicine_type"]);
        break;
      case 2:
        isValid = await form.trigger([
          "dose_count_daily",
          "notification_methods",
          "email",
          "phone_number",
          "browser_permission",
        ]);
        break;
      case 3:
        isValid = await form.trigger(["start_date", "dose_schedules"]);
        break;
      case 4:
        isValid = await form.trigger(["quantity", "refill_reminder", "refill_threshold"]);
        break;
      case 5:
        isValid = true;
        break;
    }

    return isValid;
  };

  const goNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    const formData = form.getValues();

    // Transform to required format
    const transformedData: any = {
      medicine_name: formData.medicine_name,
      medicine_type: formData.medicine_type,
      dose_count_daily: formData.dose_count_daily,
      notification_methods: formData.notification_methods.map((method) => {
        if (method === "push") return "push_notification";
        return method;
      }),
      start_date: formData.start_date,
      quantity: formData.quantity,
      refill_reminder: formData.refill_reminder,
      refill_threshold: formData.refill_threshold,
      dose_schedules: formData.dose_schedules.map((schedule) => ({
        dose_number: schedule.dose_number,
        amount: schedule.amount,
        time: schedule.time ? `${schedule.time}:00` : "",
      })),
    };

    // Only add phone_number if it exists
    if (formData.phone_number) {
      transformedData.phone_number = formData.phone_number;
    }

    if (onSubmitProp) {
      onSubmitProp(transformedData);
    } else {
      console.log("Medicine Reminder Set:", JSON.stringify(transformedData, null, 2));
      alert("Medicine reminder has been set successfully!");
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Medicine Details";
      case 2:
        return "Select Doses Per Day";
      case 3:
        return "Set Timing for Each Dose";
      case 4:
        return "Quantity & Refill Settings";
      case 5:
        return "Review & Confirm";
      default:
        return "";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return Pill;
      case 2:
        return Calendar;
      case 3:
        return Clock;
      case 4:
        return Package;
      case 5:
        return CheckCircle2;
      default:
        return Pill;
    }
  };

  const getStepImage = () => {
    return STEP_IMAGES[step as keyof typeof STEP_IMAGES] || STEP_IMAGES[1];
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1MedicineDetails form={form} />;
      case 2:
        return <Step2DosesNotifications form={form} />;
      case 3:
        return <Step3Timing form={form} />;
      case 4:
        return <Step4Quantity form={form} />;
      case 5:
        return <Step5Review form={form} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  const StepIcon = getStepIcon();

  return (
    <div className="flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 pt-2">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 md:h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Image Side */}
            <div className="hidden md:flex bg-gradient-to-br from-primary/5 to-purple-100 items-center justify-center overflow-hidden">
              <img
                src={getStepImage()}
                alt={getStepTitle()}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>

            {/* Form Side */}
            <div className="w-full p-6 flex flex-col">
              {/* Mobile Icon */}
              <div className="flex justify-center md:hidden mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <StepIcon className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-1 text-center md:text-left mb-4">
                <h2 className="text-3xl font-semibold tracking-tight mb-3">
                  {getStepTitle()}
                </h2>
                <p className="text-muted-foreground">
                  Step <span className="text-primary">{step}</span> of {TOTAL_STEPS}
                </p>
              </div>

              {/* Step Content */}
              <Form {...form}>
                <form className="grow h-[300px] transition-all duration-300">
                  {renderStep()}
                </form>
              </Form>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 mt-auto">
                <Button
                  variant="outline"
                  disabled={step === 1}
                  onClick={goBack}
                  className="px-5 h-9"
                  type="button"
                >
                  Back
                </Button>

                <div className="flex gap-1.5">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === step
                          ? "bg-primary w-5"
                          : i + 1 < step
                          ? "bg-primary/50"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {step < TOTAL_STEPS ? (
                  <Button onClick={goNext} className="px-5 h-9" type="button">
                    Next
                  </Button>
                ) : (
                  <div className="w-[68px]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}