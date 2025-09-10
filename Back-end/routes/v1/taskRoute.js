const express = require("express");
const Router = express.Router();
const {authenticate} = require('../../middleware/v1/verification/Auth')
const {createTask, getTask, editTask} = require('../../controller/v1/taskController')
// getRequirement, editRequirement, deleteRequirement

Router.post("/create",authenticate, createTask);
Router.get("/get",authenticate, getTask);
Router.put("/edit/:id",authenticate, editTask);
// Router.delete("/delete/:id",authenticate, deleteRequirement);


module.exports  = Router