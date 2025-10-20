const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./database/dbConfigue.js");
const { createMessages } = require("./controller/v1/messageController");

// ====================
// Import Route Modules
// ====================
const authRoute = require("./routes/v1/AuthRoute");
const customerRoute = require("./routes/v1/customerRoute");
const meetingRoute = require("./routes/v1/meetingRoute");
const callRoute = require("./routes/v1/callRoute");
const RequirementRoute = require("./routes/v1/requirementRoute");
const taskRoute = require("./routes/v1/taskRoute");
const attendanceRoute = require("./routes/v1/attendanceRoute");
const teamWorkRoute = require("./routes/v1/teamWorkRoute");
const pendingRoute = require("./routes/v1/pendingRoute");
const calendarRoute = require("./routes/v1/calendarRoute");
const completedRoute = require("./routes/v1/completedRoute");
const workAssignRoute = require("./routes/v1/workAssignRoute");
const worklogRoute = require("./routes/v1/worklogRoute");
const dealRoute = require("./routes/v1/dealRoute");
const messageRoute = require("./routes/v1/messageRoute");
const trashRoute = require("./routes/v1/trashRoute");
const subTaskRoute = require("./routes/v1/subTaskRoute");

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// ====================
// Mount Routes
// ====================
app.use("/api/auth", authRoute);
app.use("/api/customer", customerRoute);
app.use("/api/meetings", meetingRoute);
app.use("/api/calls", callRoute);
app.use("/api/requirement", RequirementRoute);
app.use("/api/task", taskRoute);
app.use("/api/attendance", attendanceRoute);
app.use("/api/team", teamWorkRoute);
app.use("/api/pending", pendingRoute);
app.use("/api/calendar", calendarRoute);
app.use("/api/completed", completedRoute);
app.use("/api/work", workAssignRoute);
app.use("/api/worklog", worklogRoute);
app.use("/api/deals", dealRoute);
app.use("/api/message", messageRoute);
app.use("/api/trash", trashRoute);
app.use("/api/sub-task", subTaskRoute);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// =====================
// ✅ Socket.IO Section
// =====================
io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  // =====================
  // 💬 MESSAGE SYSTEM (your existing code)
  // =====================
  socket.on("joinRoom", (room) => {
    socket.join(room);
    // console.log(`Socket ${socket.id} joined room ${room}`);
  });

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

  // =====================
  // 🔔 NOTIFICATION SYSTEM (new)
  // =====================

  // When user logs in, frontend emits: socket.emit("registerUser", userId)
  socket.on("registerUser", (userId) => {
    socket.join(userId); // Each user gets their own private room
    console.log(`User ${userId} joined personal room`);
  });

  // When backend or another user sends notification
  socket.on("send_notification", (data) => {
    const { receiverId, notification } = data;
    // Emit notification to the specific user’s room
    io.to(receiverId).emit("receiveNotification", notification);
  });

  // =====================
  // 🔌 Disconnect
  // =====================
  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);
  });
});


// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Server start failed:", err);
  }
};

startServer();
