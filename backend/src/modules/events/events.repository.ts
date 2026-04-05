import { prisma } from "../../config/database";
import { Prisma, EventStatus } from "@prisma/client";
import { EventFilters } from "../../types";

export const eventsRepository = {
  async findAll(filters: EventFilters) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 12);
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      ...(filters.status ? { status: filters.status as EventStatus } : {}),
      ...(filters.category ? { category: { contains: filters.category } } : {}),
      ...(filters.city ? { city: { contains: filters.city } } : {}),
      ...(filters.isFeatured !== undefined
        ? { isFeatured: filters.isFeatured }
        : {}),
      ...(filters.organizerId ? { organizerId: filters.organizerId } : {}),
      ...(filters.dateFrom
        ? { dateStart: { gte: new Date(filters.dateFrom) } }
        : {}),
      ...(filters.dateTo ? { dateEnd: { lte: new Date(filters.dateTo) } } : {}),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [filters.sortBy ?? "dateStart"]: filters.sortOrder ?? "asc",
        },
        include: {
          organizer: { select: { id: true, username: true, avatarUrl: true } },
          ticketCategories: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              availableQuantity: true,
            },
            orderBy: { price: "asc" },
          },
          _count: { select: { bookings: true, reviews: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  },

  async findBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: {
          select: { id: true, username: true, avatarUrl: true, email: true },
        },
        ticketCategories: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
        _count: { select: { bookings: true, reviews: true, wishlists: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, username: true } },
        ticketCategories: true,
        _count: { select: { bookings: true } },
      },
    });
  },

  async create(
    organizerId: string,
    data: Omit<Prisma.EventCreateInput, "organizer" | "ticketCategories"> & {
      ticketCategories: Prisma.TicketCategoryCreateManyEventInput[];
    },
  ) {
    const { ticketCategories, ...eventData } = data;
    const totalSeats = ticketCategories.reduce(
      (s, t) => s + (t.totalQuantity as number),
      0,
    );

    return prisma.event.create({
      data: {
        ...eventData,
        organizerId,
        totalSeats,
        availableSeats: totalSeats,
        ticketCategories: { createMany: { data: ticketCategories } },
      },
      include: { ticketCategories: true },
    });
  },

  async update(id: string, data: Prisma.EventUpdateInput) {
    return prisma.event.update({
      where: { id },
      data,
      include: { ticketCategories: true },
    });
  },

  async updateStatus(
    id: string,
    status: EventStatus,
    cancellationNote?: string,
  ) {
    return prisma.event.update({
      where: { id },
      data: { status, ...(cancellationNote ? { cancellationNote } : {}) },
    });
  },

  async getFeatured(limit = 6) {
    return prisma.event.findMany({
      where: {
        isFeatured: true,
        status: "PUBLISHED",
        dateStart: { gte: new Date() },
      },
      take: limit,
      orderBy: { dateStart: "asc" },
      include: {
        ticketCategories: {
          where: { isActive: true },
          select: { price: true },
          orderBy: { price: "asc" },
          take: 1,
        },
      },
    });
  },

  async getCategories() {
    const result = await prisma.event.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    });
    return result.map((r) => ({
      category: r.category,
      count: r._count.category,
    }));
  },

  async updateBanner(id: string, bannerUrl: string) {
    return prisma.event.update({ where: { id }, data: { bannerUrl } });
  },
};
