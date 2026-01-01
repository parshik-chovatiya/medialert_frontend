import api from "@/lib/axiosClient";

export const userApi = {
  getProfile: async () => api.get("/auth/me/"),

  updateProfile: async (data: any) =>
    api.patch("/auth/me/update/", data),
};
