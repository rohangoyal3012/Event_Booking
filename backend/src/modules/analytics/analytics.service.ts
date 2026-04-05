import { prisma } from "../../config/database";

export const analyticsService = {
  async getDashboardStats() {
    const [totalUsers, totalEvents, totalBookings, revenue] = await Promise.all(
      [
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.event.count({ where: { status: "PUBLISHED" } }),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.payment.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
        }),
      ],
    );

    return {
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue: Number(revenue._sum.amount ?? 0),
    };
  },

  async getRevenueChart(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        createdAt: { gte: from },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const byDay: Record<string, number> = {};
    for (const b of bookings) {
      const day = b.createdAt.toISOString().split("T")[0];
      byDay[day] = (byDay[day] ?? 0) + Number(b.totalAmount);
    }

    const result = [];
    const d = new Date(from);
    while (d <= new Date()) {
      const key = d.toISOString().split("T")[0];
      result.push({ date: key, revenue: byDay[key] ?? 0 });
      d.setDate(d.getDate() + 1);
    }

    return result;
  },

  async getTopEvents(limit = 10) {
    const events = await prisma.event.findMany({
      orderBy: { bookings: { _count: "desc" } },
      take: limit,
      select: {
        id: true,
        title: true,
        dateStart: true,
        city: true,
        totalSeats: true,
        availableSeats: true,
        _count: { select: { bookings: true } },
      },
    });
    return events;
  },

  async getOrganizerStats(organizerId: string) {
    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          where: { paymentStatus: "PAID" },
          select: { totalAmount: true },
        },
      },
    });

    const stats = events.map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      totalSeats: e.totalSeats,
      soldSeats: e.totalSeats - e.availableSeats,
      bookingsCount: e._count.bookings,
      revenue: e.bookings.reduce((s, b) => s + Number(b.totalAmount), 0),
    }));

    return {
      events: stats,
      totalRevenue: stats.reduce((s, e) => s + e.revenue, 0),
      totalBookings: stats.reduce((s, e) => s + e.bookingsCount, 0),
    };
  },
};
