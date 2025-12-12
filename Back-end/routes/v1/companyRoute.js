const express = require("express");
const Router = express.Router();

const {createCompany, getCompanyDetails, profileImageUpload} = require('../../controller/v1/companyController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

const {upload} = require('../../middleware/v1/multer/multer');


Router.post("/create",authenticate, createCompany);
Router.get("/get",authenticate, getCompanyDetails);
Router.post("/post-profile-image", upload.single("images"), authenticate, profileImageUpload)

module.exports = Router
