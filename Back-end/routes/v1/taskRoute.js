const express = require("express");
const Router = express.Router();
const {authenticate} = require('../../middleware/v1/verification/Auth')
const {createTask} = require('../../controller/v1/taskController')
// getRequirement, editRequirement, deleteRequirement

Router.post("/create",authenticate, createRequirement);
// Router.get("/get",authenticate, getRequirement);
// Router.put("/edit/:id",authenticate, editRequirement);
// Router.delete("/delete/:id",authenticate, deleteRequirement);


module.exports  = Router