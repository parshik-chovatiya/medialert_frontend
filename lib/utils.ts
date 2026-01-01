import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const ONBOARDING_KEY = "onboarding_data";

export const getOnboardingData = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(ONBOARDING_KEY);
  return data ? JSON.parse(data) : null;
};

export const setOnboardingData = (data: any) => {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
};

export const clearOnboardingData = () => {
  localStorage.removeItem(ONBOARDING_KEY);
};