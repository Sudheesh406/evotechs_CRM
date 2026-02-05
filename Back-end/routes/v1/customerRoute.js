const express = require("express");
const Router = express.Router();
const {createLeads, getLeads, updateLeads, deleteLeads, approveLeads,
    deleteContact, updateContact, getContact, createContact, getPendingLeads,
    getRejectLeads, getGlobalLeads, getGlobalPendingLeads, getGlobalRejectLeads, getGlobalContact, assignContact
} = require('../../controller/v1/customerController')

const {getCompletedLeads, getGlobalCompletedLeads} = require('../../controller/v1/CompletedLeads')
const {authenticate} = require('../../middleware/v1/verification/Auth')

// const authentication = require("../../../");

// leads
Router.post("/lead/create",authenticate, createLeads);
Router.put("/lead/update/:id",authenticate, updateLeads);
Router.delete("/lead/delete/:id",authenticate, deleteLeads);
// Router.patch("/lead/confirm/:id",authenticate, approveLeads);
Router.get("/lead/get",authenticate, getLeads);
Router.get("/pending/lead/get",authenticate, getPendingLeads);
Router.get("/reject/lead/get",authenticate, getRejectLeads);
Router.get("/lead/complete/get",authenticate, getCompletedLeads);

Router.post("/pending/global/lead/get",authenticate, getGlobalPendingLeads);
Router.post("/lead/global/complete/get",authenticate, getGlobalCompletedLeads);
Router.post("/rejected/global/lead/get",authenticate, getGlobalRejectLeads);

Router.post("/lead/global/get",authenticate, getGlobalLeads);

//contacts
Router.post("/contact/create",authenticate, createContact);
Router.put("/contact/update/:id",authenticate, updateContact);
Router.delete("/contact/delete/:id",authenticate, deleteContact);
Router.get("/contact/get",authenticate, getContact);
Router.post("/contact/assign",authenticate, assignContact);


Router.post("/contact/global/get",authenticate, getGlobalContact);


// Router.post("/login", handleLogin);

module.exports = Router;
