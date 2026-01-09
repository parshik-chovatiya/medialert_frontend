"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { markOnboardingComplete } from "@/store/slices/onboardingSlice";
import { authApi } from "@/lib/api/authApi";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    
    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current) {
            return;
        }

        hasVerified.current = true;

        const verifySession = async () => {
            try {
                const response = await authApi.me();
                const user = response.data.data;

                dispatch(setUser(user));

                if (user.is_onboarded) {
                    dispatch(markOnboardingComplete());
                    localStorage.setItem('onboarding_completed', 'true');
                }
            } catch (error) {
                if (isAuthenticated) {
                    console.log("Session expired, clearing stale auth data");
                    dispatch(clearUser());
                }
            }
        };

        verifySession();
    }, []); 

    return <>{children}</>;
}