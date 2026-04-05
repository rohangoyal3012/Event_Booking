import { Request } from "express";

// ─── Augment Express Request ──────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isVerified: boolean;
}

// ─── Role types ───────────────────────────────────────────────────────────────
export type UserRole = "USER" | "ORGANIZER" | "ADMIN";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

// ─── Response types ───────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Filter types ─────────────────────────────────────────────────────────────
export interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  status?: EventStatus;
  dateFrom?: string;
  dateTo?: string;
  isFeatured?: boolean;
  organizerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export { Request };
