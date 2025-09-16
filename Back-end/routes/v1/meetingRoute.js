const express = require("express");
const Router = express.Router();

const {createMeetings, getMeetings, editMeetings, deleteMeetings, createMeetingFromTask} = require('../../controller/v1/meetingController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.post("/create",authenticate, createMeetings);
Router.post("/get",authenticate, getMeetings);
Router.put("/edit/:id",authenticate, editMeetings);
Router.delete('/delete/:id', authenticate, deleteMeetings)


Router.post('/create/from_task', authenticate, createMeetingFromTask)


module.exports = Router
