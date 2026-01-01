import { UseFormReturn } from "react-hook-form";
import { OnboardingData } from "./schema";

export interface StepProps {
  form: UseFormReturn<OnboardingData>;
}
