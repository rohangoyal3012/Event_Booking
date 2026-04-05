import api from "./api";

export interface BookingItem {
  ticketCategoryId: string;
  quantity: number;
}

export const bookingsService = {
  async create(payload: {
    eventId: string;
    items: BookingItem[];
    notes?: string;
  }) {
    const { data } = await api.post("/bookings", payload);
    return data.data.booking;
  },

  /** Alias used by MyBookingsPage */
  async getMine(params?: { page?: number; limit?: number; status?: string }) {
    const { data } = await api.get("/bookings/me", { params });
    return data;
  },

  async getMyBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    return bookingsService.getMine(params);
  },

  async getById(id: string) {
    const { data } = await api.get(`/bookings/${id}`);
    return data.data.booking;
  },

  async cancel(id: string, reason?: string) {
    const { data } = await api.post(`/bookings/${id}/cancel`, { reason });
    return data;
  },

  async getAll(params?: Record<string, unknown>) {
    const { data } = await api.get("/bookings/admin", { params });
    return data;
  },
};

export const paymentsService = {
  async createOrder(bookingId: string) {
    const { data } = await api.post(`/payments/bookings/${bookingId}/order`);
    return data.data;
  },

  async verify(payload: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { bookingId, ...paymentData } = payload;
    const { data } = await api.post(
      `/payments/bookings/${bookingId}/verify`,
      paymentData,
    );
    return data.data;
  },
};

export const ticketsService = {
  async getByBooking(bookingId: string) {
    const { data } = await api.get(`/tickets/booking/${bookingId}`);
    return data.data.tickets;
  },

  async validate(code: string) {
    const { data } = await api.post(`/tickets/validate/${code}`);
    return data.data;
  },
};
