const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const Attendance = require("../../models/v1/Work_space/attendance");
const { Op } = require("sequelize");
const { signup } = require("../../models/v1");
const Signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const leaves = require("../../models/v1/Work_space/Leave");
// Helper to convert 12-hour to 24-hour format

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" "); // "09:30", "AM"
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
}

const getThisMonthLeaves = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1); // first day of the month
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0); // last day of the month
  endOfMonth.setHours(23, 59, 59, 999);

  const thisMonthLeaves = await leaves.findAll({
    where: {
      leaveDate: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
      softDelete: false, // optional filter
    },
    order: [["leaveDate", "ASC"]],
  });

  return thisMonthLeaves;
};

function getTodayLeaves(leaves) {
  const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

  // Filter all leaves where today is between leaveDate and endDate
  const todayLeaves = leaves.filter((leave) => {
    const { leaveDate, endDate } = leave.dataValues;
    const start = leaveDate;
    const end = endDate || leaveDate;
    return today >= start && today <= end;
  });

  return todayLeaves;
}

function calculateHours(startTime, endTime) {
  // Convert time strings (e.g. "8:00 AM") into Date objects
  const start = new Date(`1970-01-01 ${startTime}`);
  const end = new Date(`1970-01-01 ${endTime}`);

  // If end time is next day (e.g., 10:00 PM to 6:00 AM)
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  // Calculate difference in milliseconds → convert to hours
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours;
}

const attendanceRegister = async (req, res) => {
  try {
    const details = req.body;
    const user = req.user;

    if (!details || !details.date || !details.shedule) {
      return httpError(res, 400, "Missing required fields");
    }

    // Check if already exists for same staff, date, and type
    const existingRecord = await Attendance.findOne({
      where: {
        staffId: user.id,
        attendanceDate: details.date,
        type: details.shedule, // entry or exit
      },
    });

    if (existingRecord) {
      return httpError(
        res,
        400,
        `Attendance ${details.shedule} already marked for today`
      );
    }

    // ✅ Get this month's leaves for this specific staff
    const allLeaves = await getThisMonthLeaves();

    // ✅ Filter only this user's leaves
    const userLeaves = allLeaves.filter((leave) => leave.staffId === user.id);

    // ✅ Get today's leaves for this user
    const todaysLeaves = getTodayLeaves(userLeaves);

    if (todaysLeaves && todaysLeaves.length > 0) {
      const todayLeave = todaysLeaves[0];

      if (todayLeave.status === "Approve") {
        if (todayLeave.leaveType === "fullday") {
          return httpError(res, 401, "Full day leave is registered");
        }

        if (
          todayLeave.leaveType === "morning" && !todayLeave.HalfTime || todayLeave.leaveType === "morning" && todayLeave.HalfTime === "Leave" ||
          todayLeave.leaveType === "afternoon" && !todayLeave.HalfTime || todayLeave.leaveType === "afternoon" && todayLeave.HalfTime === "Leave"
        ) {
          if (details.shedule === "exit") {
            const todaysAttendance = await Attendance.findOne({
              where: { staffId: user.id, attendanceDate: details.date },
            });

            if (!todaysAttendance) {
              return httpError(res, 400, "Entry time not found for today");
            }

            const difference = calculateHours(
              todaysAttendance.time,
              details.exitTime
            );

            if (difference != "4") {
              return httpError(
                res,
                401,
                "Half day leave allows only 4 hours of work"
              );
            }
          }
        }
      }
    }

    // Determine which time field to use
    let timeValue;
    if (details.shedule === "entry") {
      timeValue = details.entryTime;
    } else if (details.shedule === "exit") {
      timeValue = details.exitTime;
    } else {
      return httpError(res, 400, "Invalid shedule value");
    }

    // Convert to 24-hour format before saving
    const time24 = convertTo24Hour(timeValue);

    const newAttendance = await Attendance.create({
      staffId: user.id,
      attendanceDate: details.date,
      type: details.shedule,
      time: time24,
    });

    if (!newAttendance) {
      return httpError(res, 500, `Failed to register ${details.shedule} time`);
    }

    return httpSuccess(
      res,
      200,
      `${details.shedule} time registered successfully`,
      newAttendance
    );
  } catch (error) {
    console.error("Error in attendanceRegister:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


// Helper to convert 12-hour to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) return null;
  const [time, modifier] = time12h.split(" "); // "09:30", "AM"
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
}

const attendanceEdit = async (req, res) => {
  try {
    const { entryTime, exitTime, shedule } = req.body;
    const user = req.user;
    const date = req.params.id; // expected format: 'YYYY-MM-DD'

    if (!date) {
      return httpError(res, 400, "Attendance date is required");
    }

    // Only allow editing for today's date
    const todayStr = new Date().toISOString().split("T")[0];
    if (date !== todayStr) {
      return httpError(
        res,
        403,
        "You can only edit attendance for the current date"
      );
    }

    if (!entryTime && !exitTime) {
      return httpError(res, 400, "No fields to update");
    }

    let attendanceRecord;

    if (shedule === "entry") {
      attendanceRecord = await Attendance.findOne({
        where: {
          attendanceDate: date,
          type: "entry",
          softDelete: false,
          staffId: user.id,
        },
      });

      if (!attendanceRecord) {
        return httpError(
          res,
          404,
          "Entry attendance record not found for today"
        );
      }

      const time24 = convertTo24Hour(entryTime);
      await attendanceRecord.update({ time: time24 });
      return httpSuccess(
        res,
        200,
        "Entry time updated successfully",
        attendanceRecord
      );
    } else if (shedule === "exit") {
      attendanceRecord = await Attendance.findOne({
        where: {
          attendanceDate: date,
          type: "exit",
          softDelete: false,
          staffId: user.id,
        },
      });

      if (!attendanceRecord) {
        return httpError(
          res,
          404,
          "Exit attendance record not found for today"
        );
      }

      const time24 = convertTo24Hour(exitTime);
      await attendanceRecord.update({ time: time24 });
      return httpSuccess(
        res,
        200,
        "Exit time updated successfully",
        attendanceRecord
      );
    } else {
      return httpError(res, 400, "Invalid schedule type");
    }
  } catch (error) {
    console.error("Error editing attendance:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

const handleDelete = async (req, res) => {
  try {
    const date = req.params.id;
    const user = req.user;

    if (!date) {
      return httpError(res, 400, "Attendance date is required");
    }

    // Only allow deleting for today's date
    const todayStr = new Date().toISOString().split("T")[0];
    if (date !== todayStr) {
      return httpError(
        res,
        403,
        "You can only delete attendance for the current date"
      );
    }

    // Permanently delete attendance records for the user on that date
    const deletedCount = await Attendance.destroy({
      where: {
        attendanceDate: date,
        staffId: user.id,
      },
    });

    if (deletedCount === 0) {
      return httpError(res, 404, "Attendance record not found for today");
    }

    return httpSuccess(res, 200, "Attendance record deleted permanently");
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

function formatTo12Hour(time24) {
  if (!time24) return null;
  const [hoursStr, minutes] = time24.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

const attendanceGet = async (req, res) => {
  try {
    const user = req.user;

    // Get current month start and today's date
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.findAll({
      where: {
        staffId: user.id,
        softDelete: false,
        attendanceDate: {
          [Op.between]: [startOfMonth, today],
        },
      },
      order: [
        ["attendanceDate", "DESC"],
        ["time", "DESC"],
      ],
    });

    // Convert time to 12-hour format
    const formattedRecords = attendanceRecords.map((record) => {
      return {
        ...record.get(), // get raw data values
        time: formatTo12Hour(record.time),
      };
    });

    return httpSuccess(
      res,
      200,
      "Attendance records fetched successfully",
      formattedRecords
    );
  } catch (error) {
    console.error("Error in attendanceGet:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

const getStaffList = async (req, res) => {
  try {
    const user = req.user;

    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    // Fetch only id and name columns for staff role
    const staffList = await Signup.findAll({
      where: { role: "staff" },
      attributes: ["id", "name"],
    });

    return httpSuccess(res, 200, "staff list fetched successfully", staffList);
  } catch (error) {
    console.error("Error in getStaffList:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

// convert "HH:mm:ss" → "hh:mm AM/PM"
function formatToAmPm(timeStr) {
  if (!timeStr) return null;
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

// get total minutes between two HH:mm:ss strings
function getMinutesBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  return endMinutes - startMinutes;
}

// convert minutes → "H hrs M mins"
function formatMinutesToHoursMins(minutes) {
  if (minutes <= 0) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs} hrs ${mins} mins`;
  if (hrs > 0) return `${hrs} hrs`;
  return `${mins} mins`;
}

const getStaffAttendance = async (req, res) => {
  try {
    const user = req.user;

    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    const { staffId, month, year } = req.body;
    if (!staffId || !month || !year) {
      return httpError(res, 400, "staffId, month and year are required");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const attendanceRecords = await Attendance.findAll({
      where: {
        staffId,
        attendanceDate: {
          [Op.between]: [startDate, endDate],
        },
        softDelete: false,
      },
      order: [
        ["attendanceDate", "ASC"],
        ["time", "ASC"],
      ],
    });

    const grouped = {};
    attendanceRecords.forEach((rec) => {
      const dateKey = rec.attendanceDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          entryTime: null,
          exitTime: null,
          workingHours: null,
        };
      }
      if (rec.type === "entry") {
        grouped[dateKey].entryTime = rec.time;
      } else if (rec.type === "exit") {
        grouped[dateKey].exitTime = rec.time;
      }
    });

    // calculate working hours and format times
    const finalResult = Object.values(grouped).map((item) => {
      let workingMinutes = 0;
      if (item.entryTime && item.exitTime) {
        workingMinutes = getMinutesBetween(item.entryTime, item.exitTime);
      }
      return {
        date: item.date, // still YYYY-MM-DD
        entryTime: item.entryTime ? formatToAmPm(item.entryTime) : null,
        exitTime: item.exitTime ? formatToAmPm(item.exitTime) : null,
        workingHours: workingMinutes
          ? formatMinutesToHoursMins(workingMinutes)
          : null,
      };
    });

    return httpSuccess(
      res,
      200,
      "Attendance fetched successfully",
      finalResult
    );
  } catch (error) {
    console.error("error found in get staff attendance", error);
    return httpError(res, 500, "Internal Server Error",error);
  }
};

module.exports = {
  attendanceRegister,
  attendanceGet,
  attendanceEdit,
  handleDelete,
  getStaffAttendance,
  getStaffList,
  getStaffList,
};
