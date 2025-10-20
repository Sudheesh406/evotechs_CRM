const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const team = require("../../models/v1/Team_work/team");
const signup = require("../../models/v1/Authentication/authModel");
const workAssign = require("../../models/v1/Work_space/workAssign");
const trash = require('../../models/v1/Trash/trash')
const roleChecker = require("../../utils/v1/roleChecker");

const { Op, Sequelize } = require("sequelize");

const createTodo = async (req, res) => {
  try {
    const { params } = req.body;
    const user = req.user;

    // Check admin access
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // Normalize input
    const title = params.title;
    const description = params.description;
    const dueDate = params.dueDate;
    const priority = params.priority?.toLowerCase() || "medium";
    const teamId = params.teamId || params.team?.id || null;
    const workUpdate = params.status;

    const assignedName = params.assignedName || params.assignedTo?.name;
    const assignedEmail = params.assignedEmail || params.assignedTo?.email;

    // Validate required fields
    if (!title || !description || !dueDate || !priority || !assignedName) {
      return httpError(res, 400, "All required fields must be provided.");
    }

    if (assignedName !== "Admin" && !assignedEmail) {
      return httpError(res, 400, "Staff must have an email.");
    }

    // Prepare task object
    let taskData = {
      title,
      description,
      priority,
      teamId,
      date: dueDate,
      workUpdate,
    };
    taskData.createrId = user.id;

    if (assignedName === "Admin") {
      taskData.admin = true;

      const newTask = await workAssign.create(taskData);
      return httpSuccess(res, 201, "Work created successfully", newTask);
    } else {
      // Find staff by name and email
      const staffDetails = await signup.findOne({
        where: { name: assignedName, email: assignedEmail },
      });

      if (!staffDetails) {
        return httpError(res, 404, "Assigned staff not found.");
      }

      taskData.staffId = staffDetails.id;

      const newTask = await workAssign.create(taskData);
      return httpSuccess(res, 201, "Work assigned successfully", newTask);
    }
  } catch (error) {
    console.error("Error in createTodo:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

const updateTodo = async (req, res) => {
  try {
    const { params } = req.body; // taskId to identify the work
    const user = req.user;

    // Check admin access
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // Find existing task
    const existingTask = await workAssign.findByPk(params.id);
    if (!existingTask || existingTask.softDelete) {
      return httpError(res, 404, "Task not found.");
    }

    // Normalize input
    const title = params.title;
    const description = params.description;
    const dueDate = params.dueDate;
    const priority = params.priority;
    const teamId = params.team?.id || params.teamId;
    const workUpdate = params.status;

    const assignedName = params.assignedName || params.assignedTo?.name;
    const assignedEmail = params.assignedEmail || params.assignedTo?.email;

    // Validate required fields
    if (!title || !description || !dueDate || !priority || !assignedName) {
      return httpError(res, 400, "All required fields must be provided.");
    }

    let updatedData = {
      title,
      description,
      priority,
      teamId,
      date: dueDate,
      workUpdate,
    };

    updatedData.createrId = user.id;
    if (assignedName === "Admin") {
      updatedData.staffId = null;
      updatedData.admin = true;
    } else {
      // Find staff by name and email
      const staffDetails = await signup.findOne({
        where: { name: assignedName, email: assignedEmail },
      });

      if (!staffDetails) {
        return httpError(res, 404, "Assigned staff not found.");
      }

      updatedData.staffId = staffDetails.id;
      updatedData.admin = false;
    }

    // Update the task
    await existingTask.update(updatedData);

    return httpSuccess(res, 200, "Task updated successfully", existingTask);
  } catch (error) {
    console.error("Error in editTodo:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const allUser = await signup.findAll({
      where: { role: "staff" },
      attributes: ["name", "email"],
    });
    const teams = await team.findAll({});

    return httpSuccess(res, 200, "user getted successfully", {
      allUser,
      teams,
    });
  } catch (error) {
    console.error("Error in getting user details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const getWorkDetails = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);

    if (!access) {
      const staffId = 1;
      const teamDetails = await team.findAll({
        where: Sequelize.where(
          Sequelize.fn(
            "JSON_CONTAINS",
            Sequelize.col("staffIds"),
            JSON.stringify(staffId)
          ),
          1
        ),
        attributes: ["id"], // only fetch id column from DB
      });
      const teamIds = teamDetails.map((t) => t.id);

      const workDetails = await workAssign.findAll({
        where: {
          [Op.or]: [
            { teamId: { [Op.in]: teamIds } },
            { staffId: staffId },
            { softDelete: false },
          ],
        },
        include: [
          {
            model: signup,
            as: "assignedStaff", // alias from your association
            attributes: ["name", "email"],
          },
          {
            model: team,
            as: "team", // alias from your association
            attributes: ["name"],
          },
        ],
      });

      return httpSuccess(
        res,
        200,
        "work details getted successfully",
        workDetails
      );
    } else {
      const workDetails = await workAssign.findAll({
        where: { softDelete: false },
        include: [
          {
            model: signup,
            as: "assignedStaff", // use the same alias
            attributes: ["name", "email"], // only fetch what you need
          },
          {
            model: team,
            as: "team", // same alias here
            attributes: ["teamName"], // only fetch team name
          },
        ],
      });
      return httpSuccess(
        res,
        200,
        "work details getted successfully",
        workDetails
      );
    }
  } catch (error) {
    console.error("Error in getting work details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const { id } = req.params;
    if (!id) {
      return httpError(res, 400, "id is required.");
    }

    // find the record
    const existing = await workAssign.findOne({ where: { id } });

    if (!existing) {
      return httpError(res, 404, "Work assignment not found.");
    }

    const moment = require("moment-timezone");

    // Get current Indian Railway time (IST)
    const now = moment().tz("Asia/Kolkata");

    const currentDate = now.format("YYYY-MM-DD"); // only date
    const currentTime = now.format("HH:mm:ss");

    await trash.create({
      data: "Assignment",
      dataId: id,
      staffId: user.id, // can be null if no staff
      date: currentDate,
      time: currentTime,
      // dateTime will automatically use default: DataTypes.NOW
    });

    // Soft delete: update the flag instead of destroying
    await existing.update({ softDelete: true });

    return res.status(200).json({
      success: true,
      message: "Work assignment soft deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleting work details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const getAssignedWork = async (req, res) => {
  try {
    const staff = req.user; // logged-in staff
    const staffId = staff.id;

    // Fetch all teams to find which teams this staff belongs to
    const teamDetails = await team.findAll({});
    const staffTeamIds = teamDetails
      .filter((team) => team.staffIds.includes(staffId))
      .map((team) => team.id);

    // Fetch work assignments with team name included
    const workAssigns = await workAssign.findAll({
      where: {
        softDelete: false,
        [Sequelize.Op.or]: [
          { staffId: staffId },
          { teamId: staffTeamIds.length ? staffTeamIds : null },
        ],
      },
      include: [
        {
          model: team,
          as: "team", // Make sure your association uses this alias
          attributes: ["id", "teamName"], // Only select id and name
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({ success: true, data: workAssigns });
  } catch (error) {
    console.error("Error fetching work assignments:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const stageUpdate = async (req, res) => {
  try {
    const user = req.user; // currently logged-in user
    const { id } = req.params;

    // console.log("Updating work with ID:", id);

    const existing = await workAssign.findOne({ where: { id } });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Work not found" });
    }

    let newStatus = existing.workUpdate;

    if (existing.workUpdate === "Pending") {
      newStatus = "Progress";
    } else if (existing.workUpdate === "Progress") {
      newStatus = "Completed";
    } else {
      // Already completed
      return res
        .status(400)
        .json({ success: false, message: "Work is already completed" });
    }

    await existing.update({ workUpdate: newStatus });

    return res.status(200).json({
      success: true,
      message: `Work updated to ${newStatus}`,
      data: existing,
    });
  } catch (error) {
    console.error("Error in updating work:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



const adminDashboard = async (req, res) => {
  const user = req.user;

  // Check admin access
  const access = await roleChecker(user.id);
  if (!access) {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }

  try {
    // Find work assignments with workUpdate 'Progress' or 'Pending' for admin
    const existing = await workAssign.findAll({
      where: {
        admin: true,
        workUpdate: {
          [Op.or]: ['Progress', 'Pending']
        }
      }
    });

    // Return the results
    return res.status(200).json({ success: true, data: existing });

  } catch (error) {
    console.error('Error found in admin dashboard:', error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createTodo,
  updateTodo,
  getUserDetails,
  getWorkDetails,
  deleteTodo,
  getAssignedWork,
  stageUpdate,
  adminDashboard
};
