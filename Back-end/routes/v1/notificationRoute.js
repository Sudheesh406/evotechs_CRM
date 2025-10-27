const express = require("express");
const Router = express.Router();

const {clearNotification} = require('../../controller/v1/notificationController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.delete("/clear/:id",authenticate, clearNotification);
Router.delete("/clear",authenticate, clearNotification);


module.exports = Router
