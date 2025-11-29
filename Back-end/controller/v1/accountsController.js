const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const DayBook = require("../../models/v1/Accounts/dayBookModel");
const IncomeSheet = require("../../models/v1/Accounts/incomeSheetModal");

const CreateDayBookRecord = async (req, res) => {
  try {
    const user = req.user;
    const { month, year, type, entries } = req.body;

    if (!month || !year || !type || !entries) {
      return httpError(res, 400, "month, year, type, and entries are required");
    }

    // Find existing DayBook record
    let dayBookRecord = await DayBook.findOne({
      where: { month, year, type },
    });

    if (dayBookRecord) {
      // Replace existing entries with new ones
      await dayBookRecord.update({ entries });
      return httpSuccess(
        res,
        200,
        "DayBook entries replaced successfully",
        dayBookRecord
      );
    } else {
      // Create new DayBook record
      const newRecord = await DayBook.create({
        month,
        year,
        type,
        entries,
        userId: user?.id || null,
      });
      return httpSuccess(res, 201, "DayBook created successfully", newRecord);
    }
  } catch (error) {
    console.error("Error in creating/updating day book", error);
    return httpError(res, 500, "Internal Server Error Please Try Again", error);
  }
};

const getDayBookRecord = async (req, res) => {
  const { selectedYear, selectedMonth, selectedType } = req.body;

  if (!selectedYear || !selectedMonth || !selectedType) {
    return httpError(res, 400, "Missing required fields: year, month, or type");
  }

  console.log(selectedYear, selectedMonth, selectedType);

  try {
    const dayBookRecord = await DayBook.findOne({
      where: {
        year: selectedYear,
        month: selectedMonth,
        type: selectedType,
      },
    });

    console.log("dayBookRecord", dayBookRecord);

    if (!dayBookRecord) {
      return httpSuccess(res, 200, "No DayBook record found", null);
    }

    return httpSuccess(
      res,
      200,
      "DayBook record fetched successfully",
      dayBookRecord
    );
  } catch (error) {
    console.error("Error fetching DayBook record:", error);
    return httpError(
      res,
      500,
      "Internal Server Error. Please try again later.",
      error
    );
  }
};

const CreateIncomeSheetRecord = async (req, res) => {
  try {
    const user = req.user;
    const { month, year, type, entries } = req.body;

    if (!month || !year || !type || !entries) {
      return httpError(res, 400, "month, year, type, and entries are required");
    }

    // Find existing DayBook record
    let incomeSheetRecord = await IncomeSheet.findOne({
      where: { month, year, type },
    });

    if (incomeSheetRecord) {
      // Replace existing entries with new ones
      await incomeSheetRecord.update({ entries });
      return httpSuccess(
        res,
        200,
        "income Sheet Record entries replaced successfully",
        incomeSheetRecord
      );
    } else {
      // Create new income Sheet record
      const newRecord = await IncomeSheet.create({
        month,
        year,
        type,
        entries,
        userId: user?.id || null,
      });
      return httpSuccess(
        res,
        201,
        "income Sheet created successfully",
        newRecord
      );
    }
  } catch (error) {
    console.error("Error in creating/updating income sheet", error);
    return httpError(res, 500, "Internal Server Error Please Try Again", error);
  }
};

const getIncomeSheetRecord = async (req, res) => {
  const { selectedYear, selectedMonth, selectedType } = req.body;

  if (!selectedYear || !selectedMonth || !selectedType) {
    return httpError(res, 400, "Missing required fields: year, month, or type");
  }


  try {
    const incomeSheetRecord = await IncomeSheet.findOne({
      where: {
        year: selectedYear,
        month: selectedMonth,
        type: selectedType,
      },
    });

    console.log("income Sheet Record", incomeSheetRecord);

    if (!incomeSheetRecord) {
      return httpSuccess(res, 200, "No income sheet record found", null);
    }

    return httpSuccess(
      res,
      200,
      "income sheet record fetched successfully",
      incomeSheetRecord
    );
  } catch (error) {
    console.error("Error fetching income sheet record:", error);
    return httpError(
      res,
      500,
      "Internal Server Error. Please try again later.",
      error
    );
  }
};

module.exports = {
  CreateDayBookRecord,
  getDayBookRecord,
  CreateIncomeSheetRecord,
  getIncomeSheetRecord,
};
