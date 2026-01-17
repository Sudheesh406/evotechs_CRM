const express = require("express");
const Router = express.Router();
const { authenticate } = require("../../middleware/v1/verification/Auth");
const {
  CreateDayBookRecord,
  getDayBookRecord,
  getIncomeSheetRecord,
  CreateIncomeSheetRecord,
  CreateITIncomeSheetRecord,
  getITIncomeSheetRecord,
} = require("../../controller/v1/accountsController");

Router.post("/day-book/create", authenticate, CreateDayBookRecord);
Router.post("/day-book/get", authenticate, getDayBookRecord);
Router.post("/income-sheet/create", authenticate, CreateIncomeSheetRecord);
Router.post("/income-sheet/get", authenticate, getIncomeSheetRecord);
Router.post("/it-income-sheet/create", authenticate, CreateITIncomeSheetRecord);
Router.post("/it-income-sheet/get", authenticate, getITIncomeSheetRecord);

module.exports = Router;
