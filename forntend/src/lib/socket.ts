import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("/", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: (cb) => {
        const token = useAuthStore.getState().accessToken;
        cb({ token });
      },
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinEventRoom(eventId: string): void {
  getSocket().emit("join:event", eventId);
}

export function leaveEventRoom(eventId: string): void {
  getSocket().emit("leave:event", eventId);
}
