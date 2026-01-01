// import axiosClient from '../axiosClient';

// export interface RegisterData {
//   email: string;
//   password: string;
//   password2: string;
//   timezone?: string;
// }

// export interface LoginData {
//   email: string;
//   password: string;
//   device_token?: string;
// }

// export interface OnboardingData {
//   name: string;
//   birthdate: string;
//   gender: string;
// }

// export const authApi = {
//   // Register new user
//   register: (data: RegisterData) => {
//     return axiosClient.post('/auth/register/', data);
//   },

//   // Login user
//   login: (data: LoginData) => {
//     return axiosClient.post('/auth/login/', data);
//   },

//   // Logout user
//   logout: (refreshToken: string) => {
//     return axiosClient.post('/auth/logout/', {
//       refresh_token: refreshToken,
//     });
//   },

//   // Get current user
//   getCurrentUser: () => {
//     return axiosClient.get('/auth/me/');
//   },

//   // Complete onboarding
//   completeOnboarding: (data: OnboardingData) => {
//     return axiosClient.post('/onboarding/', data);
//   },

//   // Check onboarding status
//   getOnboardingStatus: () => {
//     return axiosClient.get('/onboarding/status/');
//   },

//   // Update profile
//   updateProfile: (data: Partial<OnboardingData>) => {
//     return axiosClient.put('/profile/update/', data);
//   },

//   // Change password
//   changePassword: (data: { old_password: string; new_password: string; new_password2: string }) => {
//     return axiosClient.post('/profile/change-password/', data);
//   },
// };

import axiosClient from "../axiosClient";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    axiosClient.post("/auth/login/", data),

  register: (data: {
    email: string;
    password: string;
    password2: string;
    timezone: string;
  }) => axiosClient.post("/auth/register/", data),

  logout: () => axiosClient.post("/auth/logout/"),

  me: () => axiosClient.get("/auth/me/"),
};
