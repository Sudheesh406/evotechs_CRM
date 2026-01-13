const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const {
  createTask,
  getTask,
  getTaskByStage,
  editTask,
  deleteTask,
  taskStageUpdate,
  getTaskDetails,
  updateStagesAndNotes,
  getTeamTaskDetails,
  updateTeamStagesAndNotes,
  getTaskDetailForAdmin,
  updateStagesByAdmin,
  reworkUpdate,
  newUpdate,
  getTaskForAdmin,
  getTaskByStatus,
  againReworkUpdate,
  invoiceUpdate

} = require("../../controller/v1/taskController");

Router.post("/create", authenticate, createTask);
Router.get("/get", authenticate, getTask);
Router.get("/get/:data", authenticate, getTaskByStage);
Router.put("/edit/:id", authenticate, editTask);
Router.patch("/taskUpdate/:id", authenticate, taskStageUpdate);
Router.delete("/delete/:id", authenticate, deleteTask);

Router.post("/details/get", authenticate, getTaskDetails);
Router.get('/admin/get',authenticate,getTaskForAdmin)
Router.post("/admin/details/get", authenticate, getTaskDetailForAdmin);
Router.post("/stages_notes", authenticate, updateStagesAndNotes);
Router.post("/stage/update", authenticate, updateStagesByAdmin);

Router.post('/team/details/get',authenticate, getTeamTaskDetails);
Router.post('/team/stages_notest',authenticate, updateTeamStagesAndNotes);
Router.patch('/rework/update',authenticate, reworkUpdate);
Router.patch('/rework/update/direct',authenticate, againReworkUpdate);
Router.patch('/rework/finish',authenticate, newUpdate);

Router.post('/status/get',authenticate, getTaskByStatus);
Router.post('/invoice/:id',authenticate, invoiceUpdate);



module.exports = Router;
