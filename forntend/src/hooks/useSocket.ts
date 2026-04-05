import { useEffect, useRef } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

export function useSocket(): Socket {
  const { isAuthenticated } = useAuthStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    if (!connectedRef.current) {
      connectSocket();
      connectedRef.current = true;
    }
    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [isAuthenticated]);

  return getSocket();
}

export function useSocketEvent<T>(event: string, handler: (data: T) => void) {
  const socket = useSocket();

  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}
