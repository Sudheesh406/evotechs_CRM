const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const Attendance = require("../../models/v1/Work_space/attendance");
const { Op } = require("sequelize");

const attendanceRegister = async (req, res) => {
  try {
    const details = req.body;
    const user = req.user;

    console.log("Received attendance data:", details);

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

    let timeValue;
    if (details.shedule === "entry") {
      timeValue = details.entryTime;
    } else if (details.shedule === "exit") {
      timeValue = details.exitTime;
    } else {
      return httpError(res, 400, "Invalid shedule value");
    }

    const newAttendance = await Attendance.create({
      staffId: user.id,
      attendanceDate: details.date,
      type: details.shedule,
      time: timeValue,
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
      return httpError(res, 403, "You can only edit attendance for the current date");
    }

    if (!entryTime && !exitTime) {
      return httpError(res, 400, "No fields to update");
    }

    // Determine schedule type and update accordingly
    if (shedule === "entry") {
      const attendanceRecord = await Attendance.findOne({
        where: {
          attendanceDate: date,
          type: "entry",
          softDelete: false,
          staffId: user.id,
        },
      });

      if (!attendanceRecord) {
        return httpError(res, 404, "Entry attendance record not found for today");
      }

      await attendanceRecord.update({ time: entryTime });
      return httpSuccess(res, 200, "Entry time updated successfully", attendanceRecord);

    } else if (shedule === "exit") {
      const attendanceRecord = await Attendance.findOne({
        where: {
          attendanceDate: date,
          type: "exit",
          softDelete: false,
          staffId: user.id,
        },
      });

      if (!attendanceRecord) {
        return httpError(res, 404, "Exit attendance record not found for today");
      }

      await attendanceRecord.update({ time: exitTime });
      return httpSuccess(res, 200, "Exit time updated successfully", attendanceRecord);

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
      return httpError(res, 403, "You can only delete attendance for the current date");
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

    return httpSuccess(
      res,
      200,
      "Attendance records fetched successfully",
      attendanceRecords
    );
  } catch (error) {
    console.error("Error in attendanceGet:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


module.exports = { attendanceRegister, attendanceGet, attendanceEdit, handleDelete };
