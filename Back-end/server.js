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

const initIO = require("./utils/v1/socket.js"); 

const server = http.createServer(app);

const io = initIO(server);

// =====================
// Socket.IO
// =====================
io.on("connection", (socket) => {
  // Message system (your existing code, unchanged)
  socket.on("joinRoom", (room) => socket.join(room));
  socket.on("send_message", async (data) => {
    await createMessages(data);
    io.to(data.room).emit("receiveMessage", { senderId: data.senderId, message: data.message });
  });

  // 🔔 Notifications
  socket.on("registerUser", (userId) => {
    socket.join(userId.toString()); // personal room
    console.log(`User ${userId} joined personal room`);
  });

  socket.on("send_notification", (data) => {
    const { receiverId, notification } = data;
    io.to(receiverId.toString()).emit("receiveNotification", notification);
  });

  socket.on("disconnect", () => {});
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
