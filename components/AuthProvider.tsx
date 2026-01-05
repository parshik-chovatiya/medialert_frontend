"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { markOnboardingComplete } from "@/store/slices/onboardingSlice";
import { authApi } from "@/lib/api/authApi";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const restoreSession = async () => {
        try {
            // Try to fetch current user (cookies will be sent automatically)
            const response = await authApi.me();
            const user = response.data;

            // User is authenticated, save to Redux
            dispatch(setUser(user));

            // Mark onboarding as completed if user is onboarded
            if (user.is_onboarded) {
                dispatch(markOnboardingComplete());
            }
        } catch (error) {
            // No valid session, clear any stale data
            dispatch(clearUser());
            console.log("No active session");
        }
    };

    useEffect(() => {
        // Only fetch user if not already authenticated in Redux
        if (!isAuthenticated) {
            restoreSession();
        }
    }, []);

    return <>{children}</>;
}