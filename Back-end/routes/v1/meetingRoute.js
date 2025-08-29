const express = require("express");
const Router = express.Router();

const {createMeetings, getMeetings, editMeetings, deleteMeetings} = require('../../controller/v1/meetingController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.post("/create",authenticate, createMeetings);
Router.post("/get",authenticate, getMeetings);
Router.put("/edit/:id",authenticate, editMeetings);
Router.delete('/delete/:id', authenticate, deleteMeetings)


module.exports = Router
