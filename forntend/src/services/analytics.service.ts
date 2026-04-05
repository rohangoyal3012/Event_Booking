import api from "./api";
import type { AxiosResponse } from "axios";

export interface DashboardStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  upcomingEvents: number;
  pendingBookings: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface TopEvent {
  id: string;
  title: string;
  slug: string;
  totalBookings: number;
  totalRevenue: number;
  bannerUrl: string | null;
}

export interface OrganizerStats {
  totalEvents: number;
  publishedEvents: number;
  totalBookings: number;
  totalRevenue: number;
  avgRating: number;
}

const pick = <T>(res: AxiosResponse<{ data: T }>) => res.data.data;

export const analyticsService = {
  getDashboardStats: (): Promise<DashboardStats> =>
    api.get("/analytics/dashboard").then(pick),

  getRevenueChart: (days = 30): Promise<RevenueDataPoint[]> =>
    api.get("/analytics/revenue", { params: { days } }).then(pick),

  getTopEvents: (limit = 10): Promise<TopEvent[]> =>
    api.get("/analytics/top-events", { params: { limit } }).then(pick),

  getMyStats: (): Promise<OrganizerStats> =>
    api.get("/analytics/my-stats").then(pick),
};
