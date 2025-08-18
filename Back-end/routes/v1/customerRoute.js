const express = require("express");
const Router = express.Router();
const {createLeads} = require('../../controller/v1/customerController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

// const authentication = require("../../../");

Router.post("/lead/create",authenticate, createLeads);
// Router.post("/login", handleLogin);

module.exports = Router;
