// socket.js
let io;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

   
// Socket.IO
io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // Join a room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    // console.log(`Socket ${socket.id} joined room ${room}`);
  });

    socket.on("joinNotificationRoom", (userId) => {
    if (userId) {
      socket.join(`notify_${userId}`);
      // console.log(`User ${userId} joined notification room`);
    }
  });

  // Listen for sending messages
  socket.on("send_message", async (data) => {
    try {
      const { room, message, senderId, receiverId } = data;

      // Save message in DB
      await createMessages(data);

      // Emit to all clients in room including sender
      io.to(room).emit("receiveMessage", { senderId, message });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  //notification
  socket.on("send_notification", (data) => {
  const { receiverId, title, message, type } = data;

  // Create a unique notification room for the receiver
  const room = `notify_${receiverId}`;

  // Send notification in real-time to the specific receiver
  io.to(room).emit("receive_notification", {
    title,
    message,
    type,
    timestamp: new Date(),
  });
});


  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);
  });
});


    return io;
  },
  getIo: () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
  },
};
