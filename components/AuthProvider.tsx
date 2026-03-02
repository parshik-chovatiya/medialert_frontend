"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { markOnboardingComplete } from "@/store/slices/onboardingSlice";
import { authApi } from "@/lib/api/authApi";

// ── Auth Loading Context ─────────────────────────────────────────────────────
// Pages can read `useAuthLoading()` to wait until the session check is done
// before deciding what to show to unauthenticated users.
const AuthLoadingContext = createContext(true);
export const useAuthLoading = () => useContext(AuthLoadingContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const [isLoading, setIsLoading] = useState(true); // true until session check finishes

    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current) return;
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
            } finally {
                setIsLoading(false); // ← session check done, safe to render auth-gated UI
            }
        };

        verifySession();
    }, []);

    return (
        <AuthLoadingContext.Provider value={isLoading}>
            {children}
        </AuthLoadingContext.Provider>
    );
}