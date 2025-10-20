// utils/v1/socket.js
let io;

function initIO(server) {
  if (!io) {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
  }
  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initIO, getIO };
