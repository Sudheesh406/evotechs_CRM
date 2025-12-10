const express = require("express");
const Router = express.Router();

const { authenticate } = require('../../middleware/v1/verification/Auth')
const { savePipeline, getPipeline,
     CreateConnection, GetPipelineConnections, 
     GetStaffList, getStaffDetails,
    profileUpload, getStaffProfile } = require('../../controller/v1/homePageController')

const {upload} = require('../../middleware/v1/multer/multer');


Router.post("/pipeline", authenticate, savePipeline);
Router.get("/pipeline", authenticate, getPipeline);

Router.post("/connection", authenticate, CreateConnection);
Router.get("/connection", authenticate, GetPipelineConnections);

Router.get("/staff-list", authenticate, GetStaffList);

Router.post("/staff-profile", upload.single("images"),authenticate, profileUpload);
Router.get("/staff-profile",authenticate, getStaffProfile);

Router.get("/staff-details", authenticate, getStaffDetails);

module.exports = Router
