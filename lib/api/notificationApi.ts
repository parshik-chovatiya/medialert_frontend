import axiosClient from "../axiosClient";

export const notificationApi = {
  /**
   * Register FCM device token with the backend
   */
  registerDeviceToken: (token: string) =>
    axiosClient.post("/notifications/device-token/", { token }),

  /**
   * Unregister (clear) FCM device token on the backend
   */
  unregisterDeviceToken: () =>
    axiosClient.delete("/notifications/device-token/"),
};
