const { Op } = require("sequelize");
const task = require("../../models/v1/Project/task");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const contacts = require('../../models/v1/Customer/contacts')
const signup = require('../../models/v1/Authentication/authModel')


const getRejectedTaskForAdmin = async (req, res) => {
  try {
    const user = req.user; // ensure req.user is available
    const access = await roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // --- Pagination setup ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: completedTasks } = await task.findAndCountAll({
      where: { stage: "4", softDelete: false , reject : true},
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: contacts,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
        {
          model: signup,
          as: "staff",
          attributes: ["id", "name", "email"],
        },
      ],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error in getting rejected task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};



const getRejectedTaskForStaff = async (req, res) => {
  try {
    const user = req.user; // make sure req.user is available
    const access = await roleChecker(user.id);

    if (access) {
      return httpError(res, 403, "Access denied. staff only.");
    }

    // 🧭 Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // default 10 per page
    const offset = (page - 1) * limit;

    // 🧩 Fetch paginated completed tasks
    const { count, rows: completedTasks } = await task.findAndCountAll({
      where: { stage: "4", softDelete: false, staffId: user.id, reject : true },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: contacts,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
      ],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: completedTasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
      },
    });
  } catch (error) {
    console.error("Error in getting rejected task details for staff:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const removeReject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.body;
    const taskDetails = await task.findOne({ where: { id } });

    if (!taskDetails) {
      return httpError(res, 401, "No task found with the specified ID.");
    }

    await taskDetails.update({ reject: false });

    return res.status(200).json({
      success: true,
      message: "Task successfully marked as rejected.",
    });

  } catch (error) {
    console.error("Error in reject completed task:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

module.exports = { getRejectedTaskForAdmin, getRejectedTaskForStaff, removeReject };
