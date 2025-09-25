const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");

const {
  createCalendar,
  getCalender,
  editCalendar,
  deleteCalendar,
  getLeaveRequest,
  leaveRequestUpdate,
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave
} = require("../../controller/v1/calendarController");

// Router.post("/create", authenticate, createTask);
// Router.get("/get", authenticate, getTask);

Router.post("/create", authenticate, createCalendar);
Router.post("/get", authenticate, getCalender);
Router.put("/update/:id", authenticate, editCalendar);
Router.delete("/delete/:id", authenticate, deleteCalendar);
Router.post("/get/leave", authenticate, getLeaveRequest);
Router.put("/leave/status/:id", authenticate, leaveRequestUpdate);
Router.post("/get/staff/leave", authenticate, getLeaves);
Router.post("/create/leave", authenticate, createLeave);
Router.put("/update/leave/:id", authenticate, updateLeave);
Router.delete("/delete/leave/:id", authenticate, deleteLeave);


module.exports = Router;
