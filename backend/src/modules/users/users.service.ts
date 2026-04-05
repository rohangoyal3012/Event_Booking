import { prisma } from "../../config/database";
import { getPaginationParams, paginatedResponse } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";
import { deleteCache, CacheKeys } from "../../config/redis";
import { cloudinary, CLOUDINARY_FOLDERS } from "../../config/cloudinary";

export const usersService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { bookings: true, events: true, reviews: true } },
      },
    });
    if (!user) throw AppError.notFound("User");
    return user;
  },

  async updateProfile(
    userId: string,
    data: { username?: string; phone?: string },
  ) {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, id: { not: userId } },
      });
      if (existing) throw AppError.conflict("Username already taken");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    await deleteCache(CacheKeys.userProfile(userId));
    return user;
  },

  async updateAvatar(
    userId: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const base64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: CLOUDINARY_FOLDERS.avatars,
      public_id: `avatar_${userId}`,
      overwrite: true,
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
      ],
    });

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.secure_url },
    });
    await deleteCache(CacheKeys.userProfile(userId));
    return result.secure_url;
  },

  async getAllUsers(query: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { page, limit, skip } = getPaginationParams(query);
    const where = {
      deletedAt: null,
      ...(query.role
        ? { role: query.role as "USER" | "ORGANIZER" | "ADMIN" }
        : {}),
      ...(query.search
        ? {
            OR: [
              { username: { contains: query.search } },
              { email: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(users, page, limit, total);
  },

  async deactivateUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    await deleteCache(CacheKeys.userProfile(userId));
  },

  async getUserWishlist(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
            dateStart: true,
            city: true,
            availableSeats: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async toggleWishlist(
    userId: string,
    eventId: string,
  ): Promise<{ added: boolean }> {
    const existing = await prisma.wishlist.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { userId_eventId: { userId, eventId } },
      });
      return { added: false };
    } else {
      await prisma.wishlist.create({ data: { userId, eventId } });
      return { added: true };
    }
  },
};
