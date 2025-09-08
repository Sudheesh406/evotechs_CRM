const express = require("express");
const Router = express.Router();

const {createCalls, getCalls, editCalls, deleteCalls} = require('../../controller/v1/callController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.post("/create",authenticate, createCalls);
Router.post("/get",authenticate, getCalls);
Router.put("/edit/:id",authenticate, editCalls);
Router.delete('/delete/:id', authenticate, deleteCalls)

module.exports = Router
