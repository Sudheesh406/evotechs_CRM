const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");

const { createCalendar, getCalender, editCalendar, deleteCalendar, getLeaveRequest } = require("../../controller/v1/calendarController");

// Router.post("/create", authenticate, createTask);
// Router.get("/get", authenticate, getTask);


Router.post('/create',authenticate,createCalendar)
Router.get('/get',authenticate,getCalender)
Router.put("/update/:id", authenticate, editCalendar);
Router.delete("/delete/:id", authenticate, deleteCalendar);
Router.patch("/get/leave", authenticate, getLeaveRequest);



module.exports = Router;
