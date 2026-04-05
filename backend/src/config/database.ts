import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient<Prisma.PrismaClientOptions, "error" | "warn">({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });
};

export const prisma = globalThis.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on("error", (e: any) => {
  logger.error({ err: e }, "Prisma error");
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on("warn", (e: any) => {
  logger.warn({ msg: e }, "Prisma warning");
});

export async function connectDatabase() {
  await prisma.$connect();
  logger.info("✅ Database connected");
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}
