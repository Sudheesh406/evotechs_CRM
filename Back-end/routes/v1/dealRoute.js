const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const { getDeals } = require("../../controller/v1/dealController");

Router.get("/get", authenticate, getDeals);


module.exports = Router;
