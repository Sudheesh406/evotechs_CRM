const express = require("express");
const Router = express.Router();
const {createLeads, getLeads, updateLeads, deleteLeads, approveLeads,
    deleteContact, updateContact, getContact, createContact,
} = require('../../controller/v1/customerController')

const {getCompletedLeads} = require('../../controller/v1/CompletedLeads')
const {authenticate} = require('../../middleware/v1/verification/Auth')

// const authentication = require("../../../");

// leads
Router.post("/lead/create",authenticate, createLeads);
Router.put("/lead/update/:id",authenticate, updateLeads);
Router.delete("/lead/delete/:id",authenticate, deleteLeads);
Router.patch("/lead/confirm/:id",authenticate, approveLeads);
Router.get("/lead/get",authenticate, getLeads);
Router.get("/lead/complete/get",authenticate, getCompletedLeads);

//contacts
Router.post("/contact/create",authenticate, createContact);
Router.put("/contact/update/:id",authenticate, updateContact);
Router.delete("/contact/delete/:id",authenticate, deleteContact);
Router.get("/contact/get",authenticate, getContact);



// Router.post("/login", handleLogin);

module.exports = Router;
