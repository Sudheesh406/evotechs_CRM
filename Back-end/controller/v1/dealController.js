const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const task = require("../../models/v1/Project/task");
const contacts = require("../../models/v1/Customer/contacts")
const { Op } = require("sequelize");

const getDeals = async (req, res) => {
  try {
    const user = req.user;

    const existingTasks = await task.findAll({
      where: { staffId: user.id },
      include: [
        {
          model: contacts,
          as: "customer",
          attributes: ["id", "amount", "name", "phone"],
        },
      ],
    });

    // If no tasks found return empty array
    if (!existingTasks || existingTasks.length === 0) {
      return httpSuccess(res, 200, "No task Activated", []);
    }

    const groupedByRequirement = {};

    existingTasks.forEach((t) => {
      const reqId = t.requirement;

      // safely read amount using optional chaining
      const currentAmount = t.customer?.amount ?? 0;

      if (!groupedByRequirement[reqId]) {
        groupedByRequirement[reqId] = t;
      } else {
        const existingAmount = groupedByRequirement[reqId].customer?.amount ?? 0;

        if (currentAmount > existingAmount) {
          groupedByRequirement[reqId] = t;
        }
      }
    });

    const result = Object.values(groupedByRequirement);

    return httpSuccess(res, 200, "Deals fetched successfully", result);
  } catch (error) {
    console.error("error found in get Deals", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


module.exports = { getDeals };
