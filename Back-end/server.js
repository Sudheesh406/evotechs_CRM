const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB, sequelize } = require("./database/dbConfigue");
const {createMessages} = require('./controller/v1/messageController')

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

// ====================
// Middleware Setup
// ====================
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

// ====================
// Create HTTP Server & Socket.IO
// ====================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log("A user connected:", socket.id);

  // Join a room (room name = staffId)
  socket.on("joinRoom", (staffId) => {
    socket.join(staffId);
    console.log(`Socket ${socket.id} joined room ${staffId}`);
  });

  // Listen for messages from frontend
  socket.on("send_message", (data) => {
    // console.log("sendMessage event received:", data); // <-- log the data
    createMessages(data)

    const { room, message, staffId, senderId } = data;

    // Emit to that specific room
    if (room) {
      socket.to(room).emit("receiveMessage", { staffId, message });
    } else {
      io.emit("receiveMessage", { staffId, message });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});


// ====================
// Start Server and DB
// ====================
const startServer = async () => {
  try {
    await connectDB();

    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();
