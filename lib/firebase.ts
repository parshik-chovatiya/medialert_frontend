import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type MessagePayload, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY;

const app = initializeApp(firebaseConfig);

export let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export async function requestNotificationPermission(
  swRegistration?: ServiceWorkerRegistration
): Promise<string | null> {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return null;
    }

    if (Notification.permission === "denied") {
      console.warn("Notification permission was previously denied.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted:", permission);
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase messaging is not supported by this browser.");
      return null;
    }

    if (!messaging) {
      messaging = getMessaging(app);
    }

    // Pass serviceWorkerRegistration if we have it, so Firebase doesn't auto-register an unconfigured SW
    const options: { vapidKey?: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = { 
      vapidKey: VAPID_KEY 
    };
    if (swRegistration) {
      options.serviceWorkerRegistration = swRegistration;
    }

    const token = await getToken(messaging, options);
    if (token) {
      console.log("FCM token obtained successfully.");
      return token;
    }

    console.warn("Failed to get FCM token.");
    return null;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

/**
 * Subscribe to foreground FCM messages.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 * The callback fires every time a message arrives (not just once).
 */
export async function subscribeToMessages(
  callback: (payload: MessagePayload) => void
): Promise<() => void> {
  const supported = await isSupported();
  if (!supported) return () => {};

  if (!messaging) {
    messaging = getMessaging(app);
  }
  // onMessage returns an unsubscribe function
  return onMessage(messaging, callback);
}
