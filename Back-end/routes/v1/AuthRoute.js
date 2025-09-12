const express = require("express");
const Router = express.Router();
const {handleSignup, handleLogin, roleChecker} = require('../../controller/v1/authController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

// const authentication = require("../../../");

Router.post("/signup", handleSignup);
Router.post("/login", handleLogin);
Router.get("/role", authenticate, roleChecker);

module.exports = Router;
