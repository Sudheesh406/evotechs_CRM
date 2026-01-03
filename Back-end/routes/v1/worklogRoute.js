const express = require("express");
const Router = express.Router();

const {authenticate} = require('../../middleware/v1/verification/Auth');

const {createWorklog, getWorklog, getStaffWork, getWorklogAdmin,} = require('../../controller/v1/worklogController');

Router.post('/create',authenticate, createWorklog);
Router.post('/get',authenticate, getWorklog);


Router.post('/get/staff',authenticate, getWorklogAdmin);

Router.post('/admin/get',authenticate, getStaffWork);


module.exports = Router