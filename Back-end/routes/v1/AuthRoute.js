const express = require("express");
const Router = express.Router();
const {handleSignup, handleLogin, logout, roleChecker} = require('../../controller/v1/authController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

// const authentication = require("../../../");

Router.post("/signup", handleSignup);
Router.post("/login", handleLogin);
Router.patch("/logout",authenticate, logout);
Router.get("/role", authenticate, roleChecker);

module.exports = Router;
