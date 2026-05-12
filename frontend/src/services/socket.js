import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const createDashboardSocket = (token) => {
  if (!token) return null;
  return io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
};
