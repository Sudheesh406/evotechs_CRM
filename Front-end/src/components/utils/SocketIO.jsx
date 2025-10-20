import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  path: "/socket.io",           // should match your backend
  transports: ["websocket"],    // polling optional
  withCredentials: true,        // if you use cookies/auth
});

export default socket;
