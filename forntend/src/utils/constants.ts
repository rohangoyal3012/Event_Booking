export const ROUTES = {
  HOME: "/",
  EVENTS: "/events",
  EVENT_DETAIL: (slug: string) => `/events/${slug}`,
  CHECKOUT: "/checkout",
  BOOKING_SUCCESS: "/booking-success",
  MY_BOOKINGS: "/my-bookings",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: {
    DASHBOARD: "/admin",
    EVENTS: "/admin/events",
    CREATE_EVENT: "/admin/events/new",
    EDIT_EVENT: (id: string) => `/admin/events/${id}/edit`,
    BOOKINGS: "/admin/bookings",
    USERS: "/admin/users",
    ANALYTICS: "/admin/analytics",
  },
} as const;

export const EVENT_CATEGORIES = [
  "Music",
  "Sports",
  "Arts & Culture",
  "Food & Drink",
  "Technology",
  "Business",
  "Education",
  "Health & Wellness",
  "Networking",
  "Entertainment",
  "Other",
] as const;

export const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "yellow",
  CONFIRMED: "green",
  CANCELLED: "red",
  REFUNDED: "gray",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "yellow",
  CAPTURED: "green",
  FAILED: "red",
  REFUNDED: "gray",
};

export const DEFAULT_PAGE_SIZE = 12;

export const MAX_TICKET_QUANTITY = 10;

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_MB = 5;

export const TOAST_DURATION = 4000;
