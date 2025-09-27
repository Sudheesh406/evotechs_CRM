const express = require("express");
const Router = express.Router();

const {getMessages, getAllMembers} = require('../../controller/v1/messageController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.get("/get/:id",authenticate, getMessages);
Router.get("/get/all/staff/",authenticate, getAllMembers);


module.exports = Router
