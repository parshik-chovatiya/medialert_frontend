importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Firebase config is passed via query params during SW registration
const urlParams = new URL(self.location).searchParams;

firebase.initializeApp({
    apiKey: urlParams.get("apiKey"),
    authDomain: urlParams.get("authDomain"),
    projectId: urlParams.get("projectId"),
    storageBucket: urlParams.get("storageBucket"),
    messagingSenderId: urlParams.get("messagingSenderId"),
    appId: urlParams.get("appId"),
    measurementId: urlParams.get("measurementId"),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || "MedAlert";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/logo.png",
    badge: "/logo.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});