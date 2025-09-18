const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const holiday = require("../../models/v1/Work_space/holiday");
const Leaves = require("../../models/v1/Work_space/Leave");


const { Op } = require("sequelize");


const getCalender = async (req, res) => {
  const user = req.user;
  try {
    // get current month start and end

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1st of current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of current month

    // fetch holidays between these dates and not soft deleted
    const holidays = await holiday.findAll({
      where: {
        holidayDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        softDelete: false, // or 0 depending on your column type
      },
      order: [["holidayDate", "ASC"]],
    });

    return httpSuccess(res, 200, "Successfully getted holidays", holidays);
  } catch (error) {
    console.error("error found in getCalender", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


function toMySQLDate(dateString) {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}


const createCalendar = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    // Check role
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 404, "Access not found");
    }

    // Convert date format for MySQL (YYYY-MM-DD)
    const mysqlDate = toMySQLDate(data.date);

    // 🔹 Check if this date already exists (and not soft deleted)
    const existingHoliday = await holiday.findOne({
      where: {
        holidayDate: mysqlDate,
        softDelete: false, // only if you’re using softDelete flag
      },
    });

    if (existingHoliday) {
      return res
        .status(409)
        .json({ message: "A holiday already exists for this date" });
    }

    // 🔹 If not existing, create new holiday
    const newHoliday = await holiday.create({
      createdAdminId: user.id,
      holidayName: data.type,
      description: data.description,
      holidayDate: mysqlDate,
    });

    return res.status(201).json({
      message: "Holiday created successfully",
      holiday: newHoliday,
    });
  } catch (error) {
    console.error("Error found in createCalendar", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


const editCalendar = async (req, res) => {
  try {
    const { id } = req.params; // extract id
    const data = req.body;
    const user = req.user;

    // Check if user is admin
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    const mysqlDate = toMySQLDate(data.date);

    // Find existing holiday
    const existing = await holiday.findOne({
      where: {
        softDelete: false,
        id: id,
      },
    });

    if (!existing) {
      return httpError(res, 404, "Holiday not found");
    }

    // Prepare data to update
    const editData = {
      holidayName: data.type,
      description: data.description,
      holidayDate: mysqlDate,
      createdAdminId: user.id,
    };

    // Update in DB
    await existing.update(editData);
    return httpSuccess(res, 200, "Successfully updated holiday", editData);
  } catch (error) {
    console.error("Error in editCalendar:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params; // extract id
    const user = req.user;

    // Check if user is admin
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    // Find existing holiday
    const existing = await holiday.findOne({
      where: {
        softDelete: false,
        id: id,
      },
    });

    if (!existing) {
      return httpError(res, 404, "Holiday not found");
    }
    await existing.destroy();

    return httpSuccess(res, 200, "Successfully deleted holiday");
  } catch (error) {
    console.error("Error in deleteCalendar:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};



const getLeaveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { month, year } = req.body; 

    // Check if user is admin
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    // Convert month name to number (January = 1 … December = 12)
    const monthNum = new Date(`${month} 1, ${year}`).getMonth() + 1;

    // Build start and end date for that month
    const startDate = new Date(year, monthNum - 1, 1); // first day of month
    const endDate = new Date(year, monthNum, 0); // last day of month

    // Query all leaves in that month & year
    const allLeaveRequest = await Leaves.findAll({
      where: {
        leaveDate: {
          [Op.between]: [startDate, endDate],
        },
        softDelete: false, // exclude soft-deleted records if needed
      },
      order: [["leaveDate", "ASC"]],
    });

    return res.status(200).json(allLeaveRequest);
  } catch (error) {
    console.error("Error in getLeaveRequest:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};



module.exports = { createCalendar, getCalender, editCalendar, deleteCalendar, getLeaveRequest };
