const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB, sequelize } = require("./database/dbConfigue");
// ====================
// Import Route Modules
// ====================

// Authentication routes (login, signup, password reset, etc.)
const authRoute = require("./routes/v1/AuthRoute");
const customerRoute = require("./routes/v1/customerRoute");
const meetingRoute = require("./routes/v1/meetingRoute");
const callRoute = require("./routes/v1/callRoute");
const RequirementRoute = require("./routes/v1/requirementRoute");
const taskRoute = require("./routes/v1/taskRoute");
const attendanceRoute = require("./routes/v1/attendanceRoute");

// ====================
// Middleware Setup
// ====================

app.use(express.json());
app.use(cookieParser());

// Enable CORS only in development or if frontend URL is set
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

// ====================
// Mount Routes
// ====================


// Authentication routes
app.use("/api/auth", authRoute);

// Handling Customers
app.use("/api/customer", customerRoute);

// Handling Meetings
app.use("/api/meetings", meetingRoute);

// Handling Calls
app.use("/api/Calls", callRoute);

// Handling Requirements
app.use("/api/requirement", RequirementRoute);

// Handling Task
app.use("/api/task", taskRoute);

// Handling Attendance
app.use("/api/attendance", attendanceRoute);



// ====================
// Start Server and DB
// ====================

const startServer = async () => {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Sync Sequelize models with the database (alter tables to match models)
    // await sequelize.sync({ alter: true });
    // console.log("Sequelize models synchronized");

    // 3. Start the Express server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();
