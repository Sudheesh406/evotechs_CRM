const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op, Sequelize } = require("sequelize");
const worklog = require("../../models/v1/Work_space/worklog");


const createWorklog = async (req, res) => {
  try {
    const user = req.user; // staff info from auth middleware
    const data = req.body; // already JSON from client

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const savedWorklogs = [];

    for (const day of data) {
      const { date, tasks } = day;
      if (!tasks || !Array.isArray(tasks)) continue;

      for (const task of tasks) {
        if (task.taskName || task.value) {
          // Check if a worklog already exists for this staff, date, and task
          const existing = await worklog.findOne({
            where: {
              staffId: user.id,
              date: date,
              taskName: task.taskName || "",
            },
          });

          if (existing) {
            // Update existing record
            existing.comment = task.comment || existing.comment;
            existing.time = task.value || existing.time;
            await existing.save();
            savedWorklogs.push(existing);
          } else {
            // Create new record
            const newEntry = await worklog.create({
              staffId: user.id,
              date: date,
              taskName: task.taskName || "",
              comment: task.comment || "",
              time: task.value || "00:00:00",
            });
            savedWorklogs.push(newEntry);
          }
        }
      }
    }

    return httpSuccess(res, 201, "Worklogs saved/updated", savedWorklogs);
  } catch (error) {
    console.error("Error creating/updating worklog:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const getWorklog = async (req, res) => {
  const user = req.user; // staff info

  console.log(req.body)
  const { month, year } = req.body; // month: 1-12, year: 2025

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  try {
    // Build start and end dates of the month
    const startDate = new Date(year, month - 1, 1); // first day
    const endDate = new Date(year, month, 0); // last day

    // Fetch worklogs for this staff in the given month
    const worklogs = await worklog.findAll({
      where: {
        staffId: user.id,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["date", "ASC"]],
    });

    console.log(worklogs)

    return httpSuccess(res, 200, "Worklogs fetched successfully", worklogs);
  } catch (error) {
    console.error("Error in getting worklog:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


module.exports = { createWorklog, getWorklog };
