const express = require("express");
const Router = express.Router();

const {authenticate} = require('../../middleware/v1/verification/Auth');

const {createWorklog, getWorklog} = require('../../controller/v1/worklogController');

Router.post('/create',authenticate, createWorklog)
Router.post('/get',authenticate, getWorklog)


module.exports = Router