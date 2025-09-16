const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const {
  createTask,
  getTask,
  editTask,
  deleteTask,
  taskStageUpdate,
  getTaskDetails,
  updateStagesAndNotes,
  getTeamTaskDetails
} = require("../../controller/v1/taskController");

Router.post("/create", authenticate, createTask);
Router.get("/get", authenticate, getTask);
Router.put("/edit/:id", authenticate, editTask);
Router.patch("/taskUpdate/:id", authenticate, taskStageUpdate);
Router.delete("/delete/:id", authenticate, deleteTask);

Router.post("/details/get", authenticate, getTaskDetails);
Router.post("/stages_notes", authenticate, updateStagesAndNotes);

Router.post('/team/details/get',authenticate, getTeamTaskDetails)

module.exports = Router;
