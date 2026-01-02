import axiosClient from "../axiosClient";

export interface OnboardingData {
  name: string;
  birthdate: string;
  gender: string;
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    axiosClient.post("/auth/login/", data),

  register: (data: {
    email: string;
    password: string;
    password2: string;
    timezone: string;
  }) => axiosClient.post("/auth/register/", data),

  logout: async () => {
    try {
      await axiosClient.post("/auth/logout/");
    } finally {
      // Clear localStorage flags even if API fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('onboardingData');
      }
    }
  },

  me: () => axiosClient.get("/auth/me/"),

  // Onboarding endpoints
  completeOnboarding: (data: OnboardingData) =>
    axiosClient.post("/onboarding/", data),

  getOnboardingStatus: () =>
    axiosClient.get("/onboarding/status/"),
};