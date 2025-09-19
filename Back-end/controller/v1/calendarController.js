const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const holiday = require("../../models/v1/Work_space/holiday");
const Leaves = require("../../models/v1/Work_space/Leave");
const { signup } = require("../../models/v1/index");
const dayjs = require("dayjs");

const { Op } = require("sequelize");

const getCalender = async (req, res) => {
  try {
  const user = req.user;
  const {year,month} = req.body
   if (!year || !month) {
      return httpError(res, 400, "date is required");
    }

    // Get the start and end of the month
    const startOfMonth = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const endOfMonth = dayjs(`${year}-${month}-01`).endOf("month").toDate();


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
 console.log(id)
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

    // Check if user is admin
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    const { year, month } = req.body; // e.g. { year: 2025, month: 9 }

    if (!year || !month) {
      return httpError(res, 400, "date is required");
    }

    // First and last day of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Query leaves + staff info
    const allLeaveRequest = await Leaves.findAll({
      where: {
        leaveDate: {
          [Op.between]: [startDate, endDate],
        },
        softDelete: false,
      },
      include: [
        {
          model: signup,
          as: "staff",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["leaveDate", "ASC"]],
    });

    return res.status(200).json(allLeaveRequest);
  } catch (error) {
    console.error("Error in getLeaveRequest:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const leaveRequestUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { status } = req.body; // destructure status from body

    // Check if user is admin
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    // Find existing leave
    const existing = await Leaves.findOne({ where: { id } });

    if (!existing) {
      return httpError(res, 404, "Leave not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize today at midnight

    const leaveDate = new Date(existing.startDate || existing.date); // pick your actual column
    leaveDate.setHours(0, 0, 0, 0);

    if (leaveDate < today) {
      return httpError(res, 400, "Cannot update leave status for past dates");
    }

    // ✅ Proper update with colon, and await it
    await existing.update({
      status,
      createdAdminId: user.id,
    });

    return res.status(200).json({
      message: "Leave status updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error in leave request update:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

module.exports = {
  createCalendar,
  getCalender,
  editCalendar,
  deleteCalendar,
  getLeaveRequest,
  leaveRequestUpdate,
};
