const express = require("express");
const Router = express.Router();
const {authenticate} = require('../../middleware/v1/verification/Auth')
const {createTeamWork, getTeam, getStaff, editTeam, deleteTeam, getTeamDetails} = require('../../controller/v1/teamWorkController')

Router.post("/create",authenticate, createTeamWork);
Router.get("/get",authenticate, getTeam);
Router.get("/staff/get",authenticate, getStaff);
Router.put("/update/:id",authenticate, editTeam);
Router.delete("/delete/:id",authenticate, deleteTeam);

// -----------staff-----------//

Router.get("/details/get",authenticate, getTeamDetails);

module.exports  = Router