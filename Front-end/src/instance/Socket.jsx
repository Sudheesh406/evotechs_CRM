// src/socket/socketInstance.js
import { io } from "socket.io-client";

const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;
