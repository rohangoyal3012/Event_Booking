import { prisma } from "../../config/database";
import { User, RefreshToken } from "@prisma/client";

export const authRepository = {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  },

  async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { username, deletedAt: null },
    });
  },

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async createUser(data: {
    username: string;
    email: string;
    passwordHash?: string;
    phone?: string;
    role?: "USER" | "ORGANIZER" | "ADMIN";
    oauthProvider?: string;
    oauthId?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    });
  },

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async deleteExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },

  async findUserByOAuth(
    provider: string,
    oauthId: string,
  ): Promise<User | null> {
    return prisma.user.findFirst({
      where: { oauthProvider: provider, oauthId, deletedAt: null },
    });
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },
};
