const express = require("express");
const Router = express.Router();
const {authenticate} = require("../../middleware/v1/verification/Auth");
const {CreateAdminTask, GetAdminTask, editAdminTask, deleteAdminTask, GetStatusAdminTask} = require('../../controller/v1/adminTaskController')

// const authentication = require("../../../");

Router.post("/create", authenticate, CreateAdminTask);
Router.get("/get", authenticate, GetAdminTask);
Router.put("/edit/:id", authenticate, editAdminTask);
Router.delete("/delete/:id", authenticate, deleteAdminTask);
Router.get("/get/status/:status", authenticate, GetStatusAdminTask);


module.exports = Router;
