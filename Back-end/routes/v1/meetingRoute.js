const express = require("express");
const Router = express.Router();

const {createMeetings, getMeetings, editMeetings, deleteMeetings, createMeetingFromTask, createTeamMeetingFromTask} = require('../../controller/v1/meetingController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.post("/create",authenticate, createMeetings);
Router.post("/get",authenticate, getMeetings);
Router.put("/edit/:id",authenticate, editMeetings);
Router.delete('/delete/:id', authenticate, deleteMeetings)


Router.post('/create/from_task', authenticate, createMeetingFromTask)
Router.post('/create/from_task_team',authenticate, createTeamMeetingFromTask)



module.exports = Router
