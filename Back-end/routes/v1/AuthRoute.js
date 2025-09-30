const express = require("express");
const Router = express.Router();
const {
  handleSignup,
  handleLogin,
  logout,
  roleChecker,
  getPin,
  createPin
} = require("../../controller/v1/authController");
const { authenticate } = require("../../middleware/v1/verification/Auth");

// const authentication = require("../../../");

Router.post("/signup", handleSignup);
Router.post("/login", handleLogin);
Router.patch("/logout", authenticate, logout);
Router.get("/role", authenticate, roleChecker);
Router.get("/pin", authenticate, getPin);
Router.post("/create/pin", authenticate, createPin);

module.exports = Router;
