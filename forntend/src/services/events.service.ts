import api from "./api";

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  isFree?: boolean;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  isFeatured?: boolean;
  sort?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const eventsService = {
  async getAll(filters: EventFilters = {}) {
    const { data } = await api.get("/events", { params: filters });
    return data;
  },

  async getBySlug(slug: string) {
    const { data } = await api.get(`/events/slug/${slug}`);
    return data.data.event;
  },

  async getById(id: string) {
    const { data } = await api.get(`/events/${id}`);
    return data.data.event;
  },

  async getFeatured(limit = 6) {
    const { data } = await api.get("/events/featured", { params: { limit } });
    return data.data.events ?? data.data;
  },

  async getCategories() {
    const { data } = await api.get("/events/categories");
    return data.data.categories;
  },

  async create(formData: FormData | Record<string, unknown>) {
    const { data } = await api.post("/events", formData);
    return data.data.event;
  },

  async update(id: string, body: Record<string, unknown>) {
    const { data } = await api.patch(`/events/${id}`, body);
    return data.data.event;
  },

  async updateStatus(id: string, status: string, cancellationNote?: string) {
    const { data } = await api.patch(`/events/${id}/status`, {
      status,
      cancellationNote,
    });
    return data.data.event;
  },

  async uploadBanner(id: string, file: File) {
    const formData = new FormData();
    formData.append("banner", file);
    const { data } = await api.post(`/events/${id}/banner`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.event;
  },

  async search(query: string, filters: EventFilters = {}) {
    const { data } = await api.get("/search", {
      params: { q: query, ...filters },
    });
    return data;
  },
};
