
const { Op } = require("sequelize");
const task = require("../../models/v1/Project/task");
const contacts = require("../../models/v1/Customer/contacts");
const signup = require("../../models/v1/Authentication/authModel");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");


const getResolvedTask = async (req, res) => {
  try {
    const user = req.user; // make sure req.user is available
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // Fetch all tasks where stage is "4" (completed)
    const completedTasks = await task.findAll({
      where: { stage: "3", softDelete: false , rework : false},
      order: [["updatedAt", "DESC"]],
         include: [
        {
          model: contacts, // contacts model
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
        {
          model: signup, // your staff model (or User model)
          as: "staff", // alias must match your association
          attributes: ["id", "name", "email"], // choose what you need
        },
      ], // optional: latest completed first
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
    });
  } catch (error) {
    console.error("Error in getting completed task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const getCompletedTask = async(req,res)=>{
try {
    const user = req.user; // make sure req.user is available
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const completedTasks = await task.findAll({
      where: { stage: "4", softDelete: false },
      order: [["updatedAt", "DESC"]],
         include: [
        {
          model: contacts, // contacts model
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
        {
          model: signup, // your staff model (or User model)
          as: "staff", // alias must match your association
          attributes: ["id", "name", "email"], // choose what you need
        },
      ], // optional: latest completed first
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
    });

} catch (error) {
   console.error("Error in getting completed task details for admin:", error);
  return httpError(res, 500, "Server error", error.message || error);
}
}


const getRework = async (req, res) => {
  try {
    const user = req.user; // make sure req.user is available
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // Fetch all tasks where stage is "4" (completed)
    const completedTasks = await task.findAll({
      where: { softDelete: false , rework : true},
      order: [["updatedAt", "DESC"]],
         include: [
        {
          model: contacts, // contacts model
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
        {
          model: signup, // your staff model (or User model)
          as: "staff", // alias must match your association
          attributes: ["id", "name", "email"], // choose what you need
        },
      ], // optional: latest completed first
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
    });
  } catch (error) {
    console.error("Error in getting completed task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const getStaffRework = async (req, res) => {
  try {
    const user = req.user; // make sure req.user is available

    // Fetch all tasks where stage is "4" (completed)
    const completedTasks = await task.findAll({
      where: { softDelete: false , rework : true, staffId : user.id},
      order: [["updatedAt", "DESC"]],
         include: [
        {
          model: contacts, // contacts model
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
        {
          model: signup, // your staff model (or User model)
          as: "staff", // alias must match your association
          attributes: ["id", "name", "email"], // choose what you need
        },
      ], // optional: latest completed first
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
    });
  } catch (error) {
    console.error("Error in getting completed task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const getCompletedTaskForStaff = async(req,res)=>{
try {
    const user = req.user; // make sure req.user is available
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const completedTasks = await task.findAll({
      where: { stage: "4", softDelete: false , staffId : user.id},
      order: [["updatedAt", "DESC"]],
         include: [
        {
          model: contacts, // contacts model
          as: "customer",
          attributes: ["id", "name", "email", "phone", "amount", "source"],
        },
      ], // optional: latest completed first
    });

    return res.status(200).json({
      success: true,
      data: completedTasks,
    });

} catch (error) {
   console.error("Error in getting completed task details for admin:", error);
  return httpError(res, 500, "Server error", error.message || error);
}
}



module.exports = {getCompletedTask, getResolvedTask, getRework, getStaffRework, getCompletedTaskForStaff}