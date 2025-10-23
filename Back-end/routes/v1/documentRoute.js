const express = require("express");
const Router = express.Router();

const {authenticate} = require('../../middleware/v1/verification/Auth')
const {getRequirementDocument, documentCreate} = require('../../controller/v1/documentController')

Router.get("/get/:id",authenticate, getRequirementDocument);
Router.post("/post/:id",authenticate, documentCreate);

module.exports = Router
