const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const { getPendingTask, getStaffPendingTask } = require("../../controller/v1/pendingController");

Router.get("/task/get", authenticate, getPendingTask);
Router.get("/admin/task/get", authenticate, getStaffPendingTask);


module.exports = Router;
