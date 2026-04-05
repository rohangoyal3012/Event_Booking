import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { logger } from "../utils/logger";

let io: Server;

export function createSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.authorization?.slice(7);
    if (!token) return next(new Error("Authentication required"));

    try {
      const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET) as {
        sub: string;
        role: string;
      };
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    logger.info({ userId, socketId: socket.id }, "Socket connected");

    // Join personal room
    socket.join(`user:${userId}`);

    socket.on("join:event", (eventId: string) => {
      socket.join(`event:${eventId}`);
      logger.debug({ userId, eventId }, "Joined event room");
    });

    socket.on("leave:event", (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on("disconnect", () => {
      logger.info({ userId, socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export const socketEvents = {
  emitToUser(userId: string, event: string, data: unknown) {
    getIO().to(`user:${userId}`).emit(event, data);
  },

  emitToEvent(eventId: string, event: string, data: unknown) {
    getIO().to(`event:${eventId}`).emit(event, data);
  },

  broadcastSeatsUpdate(eventId: string, availableSeats: number) {
    socketEvents.emitToEvent(eventId, "seats:updated", {
      eventId,
      availableSeats,
    });
  },

  notifyUser(
    userId: string,
    notification: { type: string; title: string; body: string },
  ) {
    socketEvents.emitToUser(userId, "notification", notification);
  },
};
