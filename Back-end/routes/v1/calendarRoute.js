const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");

const { createCalendar, getCalender, editCalendar, deleteCalendar, getLeaveRequest, leaveRequestUpdate } = require("../../controller/v1/calendarController");

// Router.post("/create", authenticate, createTask);
// Router.get("/get", authenticate, getTask);


Router.post('/create',authenticate,createCalendar)
Router.post('/get',authenticate,getCalender)
Router.put("/update/:id", authenticate, editCalendar);
Router.delete("/delete/:id", authenticate, deleteCalendar);
Router.post("/get/leave", authenticate, getLeaveRequest);
Router.put("/leave/status/:id", authenticate, leaveRequestUpdate);



module.exports = Router;
