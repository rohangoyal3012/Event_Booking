import axios from "axios";

const API_BASE_URL = "http://localhost:9000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === "admin";
  },
};

// Event API calls
export const eventService = {
  // Get all events
  getAllEvents: async (params = {}) => {
    try {
      const response = await api.get("/events", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post("/events", eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update event
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get events by category
  getEventsByCategory: async (category) => {
    try {
      const response = await api.get("/events", { params: { category } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get events by status
  getEventsByStatus: async (status) => {
    try {
      const response = await api.get("/events", { params: { status } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Booking API calls
export const bookingService = {
  // Create a new booking
  bookTickets: async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all bookings (admin only)
  getAllBookings: async () => {
    try {
      const response = await api.get("/bookings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get bookings by event ID (admin only)
  getBookingsByEventId: async (eventId) => {
    try {
      const response = await api.get(`/bookings/event/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get booking by ID
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get bookings by email
  getBookingsByEmail: async (email) => {
    try {
      const response = await api.get(`/bookings/email/${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel booking
  cancelBooking: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete booking (admin only)
  deleteBooking: async (id) => {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get event booking stats (admin only)
  getEventBookingStats: async (eventId) => {
    try {
      const response = await api.get(`/bookings/event/${eventId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
