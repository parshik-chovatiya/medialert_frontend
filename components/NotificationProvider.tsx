"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { notificationApi } from "@/lib/api/notificationApi";
import { toast } from "sonner";

/**
 * NotificationProvider
 *
 * Handles the full FCM push notification lifecycle:
 * 1. When an authenticated user is detected, requests notification permission
 * 2. On permission grant, retrieves the FCM token and sends it to the backend
 * 3. Listens for foreground messages and displays them as Sonner toasts
 */
export default function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const tokenRegistered = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || tokenRegistered.current) return;

        const registerToken = async () => {
            try {
                // Register the SW with Firebase config as query params
                if ("serviceWorker" in navigator) {
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

    // Listen for foreground messages
    useEffect(() => {
        if (!isAuthenticated) return;

        const listenForMessages = async () => {
            try {
                const payload = await onMessageListener();
                const title = payload?.notification?.title || "MedAlert";
                const body = payload?.notification?.body || "You have a new notification";

                toast(title, {
                    description: body,
                    duration: 6000,
                });

                // Continue listening for next messages
                listenForMessages();
            } catch (error) {
                console.error("Error listening for foreground messages:", error);
            }
        };

        listenForMessages();
    }, [isAuthenticated]);

    // Reset token registration on logout
    useEffect(() => {
        if (!isAuthenticated) {
            tokenRegistered.current = false;
        }
    }, [isAuthenticated]);

    return <>{children}</>;
}
