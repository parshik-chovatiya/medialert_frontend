"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { markOnboardingComplete } from "@/store/slices/onboardingSlice";
import { authApi } from "@/lib/api/authApi";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    
    // ✅ Track if we've already verified the session
    const hasVerified = useRef(false);

    useEffect(() => {
        // ✅ Only verify once on mount
        if (hasVerified.current) {
            return;
        }

        hasVerified.current = true;

        const verifySession = async () => {
            try {
                // ✅ Always verify session with backend (even if Redux says authenticated)
                const response = await authApi.me();
                const user = response.data.data;

                // ✅ Update Redux with fresh user data
                dispatch(setUser(user));

                if (user.is_onboarded) {
                    dispatch(markOnboardingComplete());
                    localStorage.setItem('onboarding_completed', 'true');
                }
            } catch (error) {
                // ✅ Session invalid - clear any stale Redux data
                if (isAuthenticated) {
                    console.log("Session expired, clearing stale auth data");
                    dispatch(clearUser());
                }
            }
        };

        verifySession();
    }, []); // ✅ Run only once on mount

    return <>{children}</>;
}