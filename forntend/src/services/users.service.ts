import api from "./api";
import type { AxiosResponse } from "axios";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  bio: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
}

const pick = <T>(res: AxiosResponse<{ data: T }>) => res.data.data;

export const usersService = {
  getProfile: (): Promise<UserProfile> => api.get("/users/me").then(pick),

  updateProfile: (data: UpdateProfileData): Promise<UserProfile> =>
    api.patch("/users/me", data).then(pick),

  updateAvatar: (file: File): Promise<{ avatarUrl: string }> => {
    const form = new FormData();
    form.append("avatar", file);
    return api
      .post("/users/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(pick);
  },

  getWishlist: (): Promise<
    {
      id: string;
      title: string;
      slug: string;
      bannerUrl: string | null;
      date: string;
    }[]
  > => api.get("/users/me/wishlist").then(pick),

  toggleWishlist: (eventId: string): Promise<{ wishlisted: boolean }> =>
    api.post(`/users/me/wishlist/${eventId}`).then(pick),

  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: UserProfile[];
    meta: { total: number; page: number; limit: number; pages: number };
  }> => api.get("/users", { params }).then((res) => res.data),

  deactivateUser: (userId: string): Promise<void> =>
    api.delete(`/users/${userId}`).then(() => undefined),
};
