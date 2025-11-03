const { Op } = require("sequelize");
const task = require("../../models/v1/Project/task");
const contacts = require("../../models/v1/Customer/contacts");
const signup = require("../../models/v1/Authentication/authModel");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");

const getResolvedTask = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Fetch all resolved tasks (stage 3)
    const { count, rows: completedTasks } = await task.findAndCountAll({
      where: { stage: "3", softDelete: false, rework: false },
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
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        data: completedTasks,
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in getting completed task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const getCompletedTask = async (req, res) => {
  try {
    const user = req.user; // ensure req.user is available
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // --- Pagination setup ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: completedTasks } = await task.findAndCountAll({
      where: { stage: "4", softDelete: false },
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
    console.error("Error in getting completed task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const getRework = async (req, res) => {
  try {
    const user = req.user;
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // ✅ Extract page and limit (default limit = 20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // ✅ Fetch paginated tasks
    const { count, rows: completedTasks } = await task.findAndCountAll({
      where: { softDelete: false, rework: true },
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

    // ✅ Return data + pagination info
    return res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: completedTasks,
    });
  } catch (error) {
    console.error("Error in getting completed task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const getStaffRework = async (req, res) => {
  try {
    const user = req.user; // Ensure req.user is available
    const page = parseInt(req.query.page) || 1; // page number from frontend
    const limit = parseInt(req.query.limit) || 20; // number of items per page
    const offset = (page - 1) * limit;

    // Count total records for pagination info
    const totalCount = await task.count({
      where: { softDelete: false, rework: true, staffId: user.id },
    });

    // Fetch paginated results
    const completedTasks = await task.findAll({
      where: { softDelete: false, rework: true, staffId: user.id },
      order: [["updatedAt", "DESC"]],
      offset,
      limit,
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
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error in getting completed task details for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const getCompletedTaskForStaff = async (req, res) => {
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
      where: { stage: "4", softDelete: false, staffId: user.id },
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
    console.error("Error in getting completed task details for staff:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const rejectUpdate = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.body;
    const taskDetails = await task.findOne({ where: { id } });

    if (!taskDetails) {
      return httpError(res, 401, "No task found with the specified ID.");
    }

    await taskDetails.update({ reject: true });

    return res.status(200).json({
      success: true,
      message: "Task successfully marked as rejected.",
    });

  } catch (error) {
    console.error("Error in reject completed task:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};



module.exports = {
  getCompletedTask,
  getResolvedTask,
  getRework,
  getStaffRework,
  getCompletedTaskForStaff,
  rejectUpdate,
};
