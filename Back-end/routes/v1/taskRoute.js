const express = require("express");
const Router = express.Router();
const {authenticate} = require('../../middleware/v1/verification/Auth')
const {createTask, getTask, editTask, deleteTask, taskStageUpdate} = require('../../controller/v1/taskController')

Router.post("/create",authenticate, createTask);
Router.get("/get",authenticate, getTask);
Router.put("/edit/:id",authenticate, editTask);
Router.patch("/taskUpdate/:id",authenticate, taskStageUpdate);
Router.delete("/delete/:id",authenticate, deleteTask);


module.exports  = Router