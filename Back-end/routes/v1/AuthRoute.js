const express = require("express");
const Router = express.Router();
const {handleSignup, handleLogin} = require('../../controller/v1/authController')

// const authentication = require("../../../");

Router.post("/signup", handleSignup);
Router.post("/login", handleLogin);

module.exports = Router;
