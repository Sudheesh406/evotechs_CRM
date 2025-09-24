const express = require("express");
const Router = express.Router();

const {createTodo, updateTodo, getUserDetails, getWorkDetails, deleteTodo} = require('../../controller/v1/workAssignController')
const {authenticate} = require('../../middleware/v1/verification/Auth')

Router.get('/assign/user_details',authenticate, getUserDetails)
Router.get('/assign/work_details',authenticate, getWorkDetails)
Router.post('/assign/create',authenticate, createTodo)
Router.put('/assign/update',authenticate, updateTodo)
Router.delete('/assign/delete/:id',authenticate, deleteTodo)

module.exports = Router