const express = require("express");
const Router = express.Router();

const {createCompany, getCompanyDetails} = require('../../controller/v1/companyController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.post("/create",authenticate, createCompany);
Router.get("/get",authenticate, getCompanyDetails);

module.exports = Router
