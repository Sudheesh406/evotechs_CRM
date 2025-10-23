const roleChecker = require("../../utils/v1/roleChecker");
const adminTask = require("../../models/v1/Project/adminTask");
const trash = require("../../models/v1/Trash/trash");

const CreateAdminTask = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    data.adminId = user.id;
    const result = await adminTask.create(data);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in creating task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const GetAdminTask = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const result = await adminTask.findAll({ where: { adminId: user.id } });
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in getting task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const editAdminTask = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const data = req.body;

    const access = await roleChecker(user.id);
    if (!access) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    // Find the task by user id and task id
    const task = await adminTask.findOne({ where: { adminId: user.id, id } });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    // Update the task
    await task.update(data);

    return res.status(200).json({
      success: true,
      result: task,
    });
  } catch (error) {
    console.error("Error in editing task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const deleteAdminTask = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    const access = await roleChecker(user.id);
    if (!access) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    // Find the task by user id and task id
    const task = await adminTask.findOne({ where: { adminId: user.id, id } });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    // Update the task
    const moment = require("moment-timezone");

    // Get current Indian Railway time (IST)
    const now = moment().tz("Asia/Kolkata");

    const currentDate = now.format("YYYY-MM-DD"); // only date
    const currentTime = now.format("HH:mm:ss");

    await trash.create({
      data: "Activity",
      dataId: id,
      staffId: user.id, // can be null if no staff
      date: currentDate,
      time: currentTime,
      // dateTime will automatically use default: DataTypes.NOW
    });
    await task.update({ softDelete: true });

    return res.status(200).json({
      success: true,
      result: task,
    });
  } catch (error) {
    console.error("Error in deleting task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const GetStatusAdminTask = async (req, res) => {
  try {
    const user = req.user;
    const data = req.params.status;

    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const result = await adminTask.findAll({
      where: { adminId: user.id, status: data },
    });
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in getting task:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

module.exports = {
  CreateAdminTask,
  GetAdminTask,
  editAdminTask,
  deleteAdminTask,
  GetStatusAdminTask,
};
