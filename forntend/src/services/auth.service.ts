import api from "./api";
import type { AuthUser } from "@/store/authStore";

export interface LoginDto {
  email: string;
  password: string;
}
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post("/auth/login", dto);
    return data.data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await api.post("/auth/register", dto);
    return data.data;
  },

  async googleAuth(
    credential: string,
  ): Promise<AuthResponse & { isNew: boolean }> {
    const { data } = await api.post("/auth/google", { credential });
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout").catch(() => {});
  },

  async logoutAll(): Promise<void> {
    await api.post("/auth/logout-all");
  },

  async refreshToken(): Promise<string> {
    const { data } = await api.post("/auth/refresh");
    return data.data.accessToken;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await api.get("/auth/me");
    return data.data.user;
  },
};
