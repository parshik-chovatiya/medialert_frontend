"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, X } from "lucide-react";
import Image from "next/image";
import { authApi } from "@/lib/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { clearOnboardingData, markOnboardingComplete } from "@/store/slices/onboardingSlice";

interface AuthComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxOnboardingData = useAppSelector((state) => state.onboarding.data);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getOnboardingData = () => {
    if (reduxOnboardingData) return reduxOnboardingData;
    
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      });

      const { user } = res.data.data;
      dispatch(setUser(user));
      
      dispatch(clearOnboardingData());
      localStorage.removeItem('guest_onboarding_completed');
      localStorage.setItem('onboarding_completed', 'true');

      toast.success("Login successful");
      
      // ✅ Only close and navigate on SUCCESS
      onClose();
      router.push("/");
    } catch (err: any) {
      // ✅ Stay on popup, only show error
      const errorMsg = err?.response?.data?.message 
        || err?.response?.data?.detail 
        || "Login failed";
      toast.error(errorMsg);
      // Don't close popup on error
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const onboardingData = getOnboardingData();

    if (!onboardingData) {
      toast.error("Please complete the onboarding first");
      onClose();
      router.push("/");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await authApi.register({
        email: registerEmail,
        password: registerPassword,
        password2: confirmPassword,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const { user } = registerRes.data.data;
      toast.success("Registration successful!");

      try {
        const onboardingRes = await authApi.completeOnboarding(onboardingData);
        const updatedUser = onboardingRes.data.data.user;

        dispatch(setUser(updatedUser));
        dispatch(markOnboardingComplete());
        dispatch(clearOnboardingData());
        
        localStorage.removeItem('guest_onboarding_completed');
        localStorage.setItem('onboarding_completed', 'true');

        toast.success("Onboarding completed successfully!");
        
        // ✅ Only close and navigate on SUCCESS
        onClose();
        router.push("/");
      } catch (onboardingErr: any) {
        dispatch(setUser(user));
        
        const onboardingErrorMsg = 
          onboardingErr?.response?.data?.message ||
          onboardingErr?.response?.data?.detail ||
          "Onboarding failed. Please update your profile later.";
        
        toast.error(onboardingErrorMsg);
        
        // ✅ Close even if onboarding fails (user is registered)
        onClose();
        router.push("/");
      }
    } catch (err: any) {
      // ✅ Stay on popup, only show error
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.password?.[0] ||
        err?.response?.data?.detail ||
        "Registration failed";
      toast.error(errorMsg);
      // Don't close popup on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#512da8]/20 via-purple-500/10 to-[#5c6bc0]/20 backdrop-blur-md" />

      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-gray-700" />
      </button>

      <div 
        className="relative z-10 w-[90vw] max-w-6xl h-[85vh] max-h-[800px] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden w-full h-full transition-all duration-600 flex border border-white/20 ${
            isRegisterMode ? 'flex-row-reverse' : 'flex-row'
          }`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(81, 45, 168, 0.25), inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
            {!isRegisterMode && (
              <div className="w-full max-w-md space-y-6 animate-fadeIn">
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2 bg-primary bg-clip-text text-transparent">
                    Welcome Back
                  </h1>
                  <p className="text-gray-600 text-sm">Sign in to continue to MedAlert</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="johndoe@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor="remember" className="text-sm cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <button className="text-sm text-primary hover:underline">
                      Forgot Password?
                    </button>
                  </div>

                  <button 
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <button
                        onClick={() => setIsRegisterMode(true)}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isRegisterMode && (
              <div className="w-full max-w-md space-y-6 animate-fadeIn">
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2 bg-primary bg-clip-text text-transparent">
                    Create Account
                  </h1>
                  <p className="text-gray-600 text-sm">Sign up to get started with MedAlert</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="johndoe@gmail.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        onClick={() => setIsRegisterMode(false)}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#5c6bc0]/10 to-[#512da8]/5 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-indigo-100/50" />
            <div className={`relative w-full max-w-md transition-all duration-500 ${isRegisterMode ? 'animate-slideIn' : 'animate-slideIn'}`}>
              {!isRegisterMode ? (
                <Image
                  src="/images/medicin-login.png"
                  alt="Medical Illustration"
                  width={400}
                  height={400}
                  className="object-contain w-full h-auto drop-shadow-2xl"
                  priority
                />
              ) : (
                <Image
                  src="/images/Sign_up.png"
                  alt="Sign up illustration"
                  width={420}
                  height={420}
                  className="object-contain w-full h-auto drop-shadow-2xl"
                  priority
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .animate-slideIn { animation: slideIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default AuthComponent;