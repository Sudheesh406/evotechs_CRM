const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op, Sequelize } = require("sequelize");
const worklog = require("../../models/v1/Work_space/worklog");
const attendance = require('../../models/v1/Work_space/attendance')


const createWorklog = async (req, res) => {
    try {
        const user = req.user; // staff info from auth middleware
        const data = req.body.worklogs || req.body; // Expecting data or data.worklogs as the array of days

        // 1. Validate incoming data
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: "Invalid data format or empty array" });
        }
        const savedWorklogs = [];
        for (const day of data) {
            const { date, attendance, tasks } = day;

            // Tasks is now an array: [{ taskName, time, comment, taskNumber }, ...]
            if (!Array.isArray(tasks)) {
                // console.warn(`Skipping day ${date}: tasks is not an array.`);
                continue; 
            }

            // 2. Iterate over the array of tasks for the current day
            for (const task of tasks) {
                // Destructure expected fields from the client payload
                const { taskName, time, comment, taskNumber } = task; 
                
                // Only process if there's an actual time value
                if (!time) continue; 

                // 3. Find existing record by staff, date, and taskNumber
                const [entry, created] = await worklog.findOrCreate({
                    where: {
                        staffId: user.id,
                        date: date,
                        taskNumber: taskNumber, // e.g., 'task1'
                    },
                    defaults: {
                        staffId: user.id,
                        date: date,
                        taskNumber: taskNumber,
                        taskName: taskName || taskNumber, // Use taskName or fall back to taskNumber
                        time: time,
                        comment: comment || "",
                        attendance: attendance || "", // Include attendance in the initial creation
                    }
                });

                // 4. Update the record if it was found (not created)
                if (!created) {
                    entry.taskName = taskName || entry.taskName; 
                    entry.comment = comment || ""; // Allow comment to be cleared if payload sends ""
                    entry.time = time;
                    entry.attendance = attendance || ""; // Update attendance for this entry
                    await entry.save();
                }

                savedWorklogs.push(entry);
            }
            
            // 5. Handle Attendance for days with no tasks but defined attendance
            // We need a way to save attendance even if no tasks exist.
            // If tasks array was empty but attendance was provided, we save a separate record 
            // for attendance only, or update a dummy/control record if your DB schema supports it.

            // OPTIONAL: If your DB schema has a single attendance record per day/staff (e.g., separate 'DailyLog' table)
            // You should update that separate table here using 'date' and 'user.id'.
            // Since you are updating worklog entries, we'll assume attendance is saved with the task entries, 
            // and the final attendance value written will be the one from the last task of the day. 
            // This is generally acceptable if all tasks for a day share the same attendance value.
        }
        
        // 6. Return success response
        return httpSuccess(res, 201, "Worklogs saved/updated", savedWorklogs);
    } catch (error) {
        console.error("Error creating/updating worklog:", error);
        return httpError(res, 500, "Internal Server Error");
    }
};



const getWorklog = async (req, res) => {
  const user = req.user; // staff info
  const { month, year } = req.body; // month: 1–12

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  try {
    // Build start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch worklogs
    const worklogs = await worklog.findAll({
      where: {
        staffId: user.id,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["date", "ASC"]],
    });

    // Fetch attendance records
    const attendanceRecords = await attendance.findAll({
      where: {
        staffId: user.id,
        attendanceDate: {
          [Op.between]: [startDate, endDate],
        },
        softDelete: 0,
      },
      order: [["attendanceDate", "ASC"], ["time", "ASC"]],
    });

    // Group attendance by date
    const groupedByDate = {};
    attendanceRecords.forEach((rec) => {
      // Make sure attendanceDate is a Date object
      const dateObj = new Date(rec.attendanceDate);
      const date = dateObj.toISOString().split("T")[0];

      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(rec);
    });

    // Calculate daily work hours
    const dailyWorkHours = Object.entries(groupedByDate).map(([date, records]) => {
      let totalMinutes = 0;
      let entryTime = null;

      records.forEach((rec) => {
        if (rec.type === "entry") {
          entryTime = rec.time;
        } else if (rec.type === "exit" && entryTime) {
          const [entryH, entryM, entryS] = entryTime.split(":").map(Number);
          const [exitH, exitM, exitS] = rec.time.split(":").map(Number);

          const entryDate = new Date(date);
          entryDate.setHours(entryH, entryM, entryS);

          const exitDate = new Date(date);
          exitDate.setHours(exitH, exitM, exitS);

          totalMinutes += (exitDate - entryDate) / (1000 * 60);
          entryTime = null;
        }
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);

      return {
        date,
        workTime: `${hours}:${minutes.toString().padStart(2, "0")}`,
      };
    });

    return httpSuccess(res, 200, "Worklogs fetched successfully", {
      worklogs,
      dailyWorkHours,
    });
  } catch (error) {
    console.error("Error in getting worklog:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};



const getStaffWork = async (req, res) => {
  try {
    const { staffId, month, year } = req.body;

    if (!staffId || !month || !year) {
      return res.status(400).json({ message: "staffId, month, and year are required" });
    }

    // Fetch staff info
    const staff = await signup.findOne({ where: { id: staffId } });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Fetch worklogs and attendance for that staff
    const [worklogs, attendanceRecords] = await Promise.all([
      worklog.findAll({ where: { staffId }, order: [["date", "ASC"], ["createdAt", "ASC"]] }),
      attendance.findAll({ where: { staffId }, order: [["attendanceDate", "ASC"], ["time", "ASC"]] }),
    ]);

    // Helper function to filter by month/year
    const filterByMonthYear = (dateField) => {
      const d = new Date(dateField);
      return d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(month);
    };

    // Grouped object by date
    const grouped = {};

    // Process worklogs
    worklogs.forEach((rec) => {
      if (!rec.date) return;
      if (!filterByMonthYear(rec.date)) return;

      const dateKey = new Date(rec.date).toISOString().split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          staffId,
          name: staff.name,
          email: staff.email,
          tasks: [],
          attendance: [],
        };
      }

      grouped[dateKey].tasks.push({
        taskName: rec.taskName,
        comment: rec.comment || "No comment",
        time: rec.time,
        taskNumber: rec.taskNumber,
      });
    });

    // Process attendance
    attendanceRecords.forEach((rec) => {
      if (!rec.attendanceDate) return;
      if (!filterByMonthYear(rec.attendanceDate)) return;

      const dateKey = new Date(rec.attendanceDate).toISOString().split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          staffId,
          name: staff.name,
          email: staff.email,
          tasks: [],
          attendance: [],
        };
      }

      grouped[dateKey].attendance.push({
        type: rec.type, // entry/exit
        time: rec.time,
      });
    });

    return res.status(200).json({
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
      },
      worklogs: Object.values(grouped),
    });
  } catch (error) {
    console.log("Error in getting staff work:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createWorklog, getWorklog, getStaffWork };
