import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  events: {
    all: ["events"] as const,
    list: (filters: Record<string, unknown>) =>
      ["events", "list", filters] as const,
    detail: (slug: string) => ["events", "detail", slug] as const,
    featured: ["events", "featured"] as const,
    categories: ["events", "categories"] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    mine: (params?: Record<string, unknown>) =>
      ["bookings", "mine", params] as const,
    detail: (id: string) => ["bookings", id] as const,
  },
  analytics: {
    dashboard: ["analytics", "dashboard"] as const,
    revenue: (days: number) => ["analytics", "revenue", days] as const,
    topEvents: ["analytics", "top-events"] as const,
    myStats: ["analytics", "my-stats"] as const,
  },
  user: {
    profile: ["user", "profile"] as const,
    wishlist: ["user", "wishlist"] as const,
  },
};
