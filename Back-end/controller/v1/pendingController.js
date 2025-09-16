const { Op } = require("sequelize");
const task = require("../../models/v1/Project/task");
const contacts = require("../../models/v1/Customer/contacts");
const signup = require("../../models/v1/Authentication/authModel")
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");

const getPendingTask = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return httpError(res, 400, "Invalid user");
    }

    // Today’s date at 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTasks = await task.findAll({
      where: {
        staffId: user.id,
        finishBy: { [Op.lt]: today },
      },
      include: [
        {
          model: contacts, // contacts model
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount","source"],
        },
        {
          model: signup, // your staff model (or User model)
          as: "staff", // alias must match your association
          attributes: ["id", "name", "email"], // choose what you need
        },
      ],
      order: [["finishBy", "ASC"]],
    });

    return httpSuccess(res, 200, "Pending tasks fetched successfully", pendingTasks);
  } catch (error) {
    console.error("Error in getPending:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


module.exports = { getPendingTask };
