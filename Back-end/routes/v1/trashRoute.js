const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const { getTrash, restore, permenantDelete } = require("../../controller/v1/trashController");

Router.post("/get", authenticate, getTrash);
Router.post("/restore", authenticate, restore);
Router.post("/delete", authenticate, permenantDelete);



module.exports = Router;
