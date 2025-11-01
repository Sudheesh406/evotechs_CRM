const { Op } = require("sequelize");
const task = require("../../models/v1/Project/task");
const contacts = require("../../models/v1/Customer/contacts");
const signup = require("../../models/v1/Authentication/authModel");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");

const getPendingTask = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return httpError(res, 400, "Invalid user");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Today’s date at 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, rows: pendingTasks } = await task.findAndCountAll({
      where: {
        staffId: user.id,
        finishBy: { [Op.lt]: today },
        stage: { [Op.in]: [0, 1, 2, 3] },
      },
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
      order: [["finishBy", "ASC"]],
      limit,
      offset,
    });

    return httpSuccess(res, 200, "Pending tasks fetched successfully", {
      tasks: pendingTasks,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error in getPending:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};



const getStaffPendingTask = async (req, res) => {
  try {
    const user = req.user;
    const admin = await roleChecker(user.id);
    if (!admin) {
      return httpError(res, 403, "Access denied");
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Today’s date at 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, rows: pendingTasks } = await task.findAndCountAll({
      where: {
        finishBy: { [Op.lt]: today },
        stage: { [Op.in]: [0, 1, 2, 3] },
      },
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
      order: [["finishBy", "ASC"]],
      limit,
      offset,
    });

    return httpSuccess(res, 200, "Pending tasks fetched successfully", {
      data: pendingTasks,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    });
  } catch (error) {
    console.error("Error in getting staff Pending:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


module.exports = { getPendingTask, getStaffPendingTask };
