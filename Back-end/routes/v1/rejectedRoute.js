const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const {removeReject, getRejectedTaskForAdmin, getRejectedTaskForStaff} = require("../../controller/v1/rejectedController")

Router.get("/get", authenticate, getRejectedTaskForAdmin);
Router.get("/staff/get", authenticate, getRejectedTaskForStaff);
Router.patch("/remove/reject", authenticate, removeReject);


module.exports = Router;