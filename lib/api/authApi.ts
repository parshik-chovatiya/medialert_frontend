import axiosClient from "../axiosClient";

export interface OnboardingData {
  name: string;
  birthdate: string;
  gender: string;
}

export interface ProfileUpdateData {
  name?: string;
  birthdate?: string;
  gender?: string;
  phone_number?: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  new_password2: string;
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('onboardingData');
      }
    }
  },

  // ✅ Fixed: /api/auth/me/
  me: () => axiosClient.get("/auth/me/"),

  // Onboarding endpoints
  completeOnboarding: (data: OnboardingData) =>
    axiosClient.post("/onboarding/", data),

  getOnboardingStatus: () =>
    axiosClient.get("/onboarding/status/"),

  // ✅ Fixed: /api/profile/update/
  updateProfile: (data: ProfileUpdateData) =>
    axiosClient.patch("/profile/update/", data),

  // ✅ Fixed: /api/profile/change-password/
  changePassword: (data: PasswordChangeData) =>
    axiosClient.post("/profile/change-password/", data),
};