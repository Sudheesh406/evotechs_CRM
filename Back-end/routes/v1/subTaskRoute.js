const express = require("express");
const Router = express.Router();

const {
  createSubTask,
  getSubTasks,
  updateSubTasks,
  checkInUpdate,
  deleteSubtask,
  deleteNotCheckedData,
  getTeamSubTasks,
  getRemovedSubTask,
  restoreSubtask,
  permanentDeleteSubtask
} = require("../../controller/v1/subTaskController");

const { authenticate } = require("../../middleware/v1/verification/Auth");

Router.post("/create", authenticate, createSubTask);
Router.get("/get/:id", authenticate, getSubTasks);
Router.get("/get/team/:id", authenticate, getTeamSubTasks);
Router.put("/update/:id", authenticate, updateSubTasks);
Router.patch("/update-checkin/:id", authenticate, checkInUpdate);
Router.delete("/delete/:id", authenticate, deleteSubtask);
Router.delete("/delete/sub/:id", authenticate, deleteNotCheckedData);
Router.get("/removed", authenticate, getRemovedSubTask);
Router.patch("/restore/:id", authenticate, restoreSubtask);
Router.patch("/permenante/delete/:id", authenticate, permanentDeleteSubtask);


module.exports = Router;
