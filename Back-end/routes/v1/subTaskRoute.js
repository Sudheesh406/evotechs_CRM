const express = require("express");
const Router = express.Router();

const {createSubTask} = require('../../controller/v1/subTaskController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.post("/create",authenticate, createSubTask);
// Router.post("/get",authenticate, getCalls);
// Router.put("/edit/:id",authenticate, editCalls);
// Router.delete('/delete/:id', authenticate, deleteCalls)

// Router.post('/create/from_task',authenticate, createCallFromTask)
// Router.post('/create/from_task_team',authenticate, createTeamCallFromTask)

module.exports = Router
