"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { requestNotificationPermission, subscribeToMessages } from "@/lib/firebase";
import { notificationApi } from "@/lib/api/notificationApi";
import { toast } from "sonner";

export default function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const tokenRegistered = useRef(false);

    // ── 1. Register service worker + FCM token once after login ──────────────
    useEffect(() => {
        if (!isAuthenticated || tokenRegistered.current) return;

        const registerToken = async () => {
            try {
                if ("serviceWorker" in navigator) {
                    // Check if the SW is already registered to avoid re-registration reloads
                    const existingReg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
                    if (!existingReg) {
                        const swParams = new URLSearchParams({
                            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
                            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
                            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
                            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
                            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
                            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
                            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
                        });
                        await navigator.serviceWorker.register(
                            `/firebase-messaging-sw.js?${swParams.toString()}`
                        );
                    }
                }

                const fcmToken = await requestNotificationPermission();
                if (fcmToken) {
                    await notificationApi.registerDeviceToken(fcmToken);
                    tokenRegistered.current = true;
                    console.log("FCM device token registered with backend.");
                }
            } catch (error) {
                console.error("Failed to register FCM token:", error);
            }
        };

        registerToken();
    }, [isAuthenticated]);

    // ── 2. Subscribe to foreground messages (persistent subscription) ─────────
    useEffect(() => {
        if (!isAuthenticated) return;

        // subscribeToMessages fires for every message and returns unsubscribe fn
        const unsubscribe = subscribeToMessages((payload) => {
            const title = payload?.notification?.title || "MediAlert";
            const body = payload?.notification?.body || "You have a new notification";

            toast(title, {
                description: body,
                duration: 6000,
            });
        });

        // Clean up listener when user logs out or component unmounts
        return () => unsubscribe();
    }, [isAuthenticated]);

    // ── 3. Reset token flag on logout so it re-registers after next login ─────
    useEffect(() => {
        if (!isAuthenticated) {
            tokenRegistered.current = false;
        }
    }, [isAuthenticated]);

    return <>{children}</>;
}
