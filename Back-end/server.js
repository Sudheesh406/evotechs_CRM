const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { connectDB } = require("./database/dbConfigue.js");

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
const companyRoute = require("./routes/v1/companyRoute");
const adminRoute = require("./routes/v1/adminTaskRoute");
const documentRoute = require("./routes/v1/documentRoute");
const notificationRoute = require('./routes/v1/notificationRoute');
const rejectRoute = require('./routes/v1/rejectedRoute');
const accountsRoute = require('./routes/v1/accountsRoute');
const homePageRoute = require('./routes/v1/homePageRoute');

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use("/api/Completed", completedRoute);
app.use("/api/work", workAssignRoute);
app.use("/api/worklog", worklogRoute);
app.use("/api/deals", dealRoute);
app.use("/api/message", messageRoute);
app.use("/api/trash", trashRoute);
app.use("/api/sub-task", subTaskRoute);
app.use("/api/company", companyRoute);
app.use("/api/adminTask", adminRoute);
app.use("/api/document", documentRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/rejected", rejectRoute);
app.use("/api/account", accountsRoute);
app.use("/api/home", homePageRoute);

const path = require("path");
const imagePath = path.join(__dirname, "images");
app.use("/api/images", express.static(imagePath));
const server = http.createServer(app);

// Initialize Socket.IO
const { init } = require("./utils/v1/socket.js");
const io = init(server);

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
