"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { authApi } from "@/lib/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { clearOnboardingData } from "@/store/slices/onboardingSlice";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    try {
      // Call login API - tokens are now in HttpOnly cookies
      const res = await authApi.login({
        email,
        password,
      });

      const { user } = res.data;

      // Save user to Redux (tokens handled by cookies automatically)
      dispatch(setUser(user));

      // Clear any leftover onboarding data
      dispatch(clearOnboardingData());

      // Mark onboarding as completed (user is logged in)
      localStorage.setItem('onboarding_completed', 'true');

      toast.success("Login successful");

      // Redirect to homepage
      router.push("/");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error 
        || err?.response?.data?.detail 
        || "Login failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to continue to MedAlert</p>
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

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Do not have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
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

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute m-2 rounded-2xl inset-0 bg-linear-to-br from-primary/20 to-primary/5 shadow-2xl" />
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="w-[380px] relative">
            <Image
              src="/images/medicin-login.png"
              alt="Medical Illustration"
              width={500}
              height={500}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}