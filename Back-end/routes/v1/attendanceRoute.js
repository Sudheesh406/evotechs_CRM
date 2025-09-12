const express = require("express");
const Router = express.Router();
const {attendanceRegister, attendanceGet, attendanceEdit, handleDelete} = require('../../controller/v1/attendanceController')
const {authenticate} = require("../../middleware/v1/verification/Auth");

// const authentication = require("../../../");

Router.post("/register", authenticate, attendanceRegister);
Router.get("/get", authenticate, attendanceGet);
Router.put("/edit/:id", authenticate, attendanceEdit);
Router.delete("/delete/:id", authenticate, handleDelete);


module.exports = Router;
