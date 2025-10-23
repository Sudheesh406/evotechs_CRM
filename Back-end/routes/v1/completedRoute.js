const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const {   getResolvedTask, getCompletedTask, getRework, getStaffRework, getCompletedTaskForStaff } = require("../../controller/v1/completedController");

// Router.get("/task/get", authenticate, getPendingTask);
Router.get("/resolved/get", authenticate, getResolvedTask);
Router.get("/rework/get", authenticate, getRework);
Router.get("/staff/rework/get", authenticate, getStaffRework);
Router.get("/get", authenticate, getCompletedTask);
Router.get("/staff/get", authenticate, getCompletedTaskForStaff);


module.exports = Router;