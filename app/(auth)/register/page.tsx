"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/lib/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { clearOnboardingData, markOnboardingComplete } from "@/store/slices/onboardingSlice";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxOnboardingData = useAppSelector((state) => state.onboarding.data);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Get onboarding data from Redux or localStorage
  const getOnboardingData = () => {
    if (reduxOnboardingData) return reduxOnboardingData;
    
    // Fallback to localStorage if Redux is empty
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('onboardingData');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Get onboarding data (from Redux or localStorage)
    const onboardingData = getOnboardingData();

    // Check if onboarding data exists
    if (!onboardingData) {
      toast.error("Please complete the onboarding form first");
      router.push("/");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register user (also sets auth cookies)
      const registerRes = await authApi.register({
        email,
        password,
        password2: confirmPassword,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const { user } = registerRes.data;

      toast.success("Registration successful!");

      // Step 2: Submit onboarding data (cookies already set from registration)
      try {
        console.log("Sending onboarding data:", onboardingData);
        const onboardingRes = await authApi.completeOnboarding(onboardingData);
        console.log("Onboarding response:", onboardingRes.data);
        
        // Update user with onboarding data
        const updatedUser = {
          ...user,
          name: onboardingData.name,
          gender: onboardingData.gender,
          birthdate: onboardingData.birthdate,
          is_onboarded: true,
        };

        dispatch(setUser(updatedUser));
        dispatch(markOnboardingComplete());
        dispatch(clearOnboardingData());

        // Mark onboarding as completed in localStorage
        localStorage.setItem('onboarding_completed', 'true');

        toast.success("Onboarding completed successfully!");
        
        // Redirect to homepage
        router.push("/");
      } catch (onboardingErr: any) {
        console.error("Onboarding failed:", onboardingErr);
        console.error("Error response:", onboardingErr?.response?.data);
        
        // Still save user but show warning
        dispatch(setUser(user));
        
        const onboardingErrorMsg = 
          onboardingErr?.response?.data?.error ||
          onboardingErr?.response?.data?.detail ||
          JSON.stringify(onboardingErr?.response?.data) ||
          "Onboarding failed. Please update your profile later.";
        
        toast.error(onboardingErrorMsg);
        router.push("/");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.password?.[0] ||
        err?.response?.data?.detail ||
        "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground mt-2">Sign up to get started with MedAlert</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="gap-2 px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <Link href="/" className="font-medium">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary/5">
        <div className="w-[420px] relative">
          <Image
            src="/images/Sign_up.png"
            alt="Sign up illustration"
            width={420}
            height={420}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}