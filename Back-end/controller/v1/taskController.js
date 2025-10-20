const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const contacts = require("../../models/v1/Customer/contacts");
const task = require("../../models/v1/Project/task");
const roleChecker = require("../../utils/v1/roleChecker");
const meetings = require("../../models/v1/Customer/meetings");
const calls = require("../../models/v1/Customer/calls");
const team = require("../../models/v1/Team_work/team");
const signup = require("../../models/v1/Authentication/authModel");
const trash = require('../../models/v1/Trash/trash')

const { Op, Sequelize } = require("sequelize");

const createTask = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;

    if (!data || !data.phone) {
      return httpError(res, 400, "Phone number is required to create a task");
    }

    // Check if contact exists for given phone & staff
    const customer = await contacts.findOne({
      where: { phone: data.phone, staffId: user.id },
    });

    if (!customer) {
      return httpError(
        res,
        400,
        "Contact not found. Cannot create task without a contact."
      );
    }

    // Create task with existing contact
    const newTask = await task.create({
      ...data,
      staffId: user.id,
      contactId: customer.id,
    });

    return httpSuccess(res, 201, "Task created successfully", newTask);
  } catch (error) {
    console.error("Error in createTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const getTask = async (req, res) => {
  const user = req.user;
  try {
    const allTask = await task.findAll({
      where: { staffId: user.id, softDelete: false },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: contacts,
          as: "customer", // must match the alias
          attributes: ["id", "name", "phone", "amount"],
        },
      ],
    });

    return httpSuccess(res, 200, "Tasks retrieved successfully", allTask);
  } catch (error) {
    console.error("Error in getTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const getTaskByStatus = async (req,res)=>{
  try {
    const user = req.user
    const parsed = req.body.parsed?.status
    console.log('req.body',req.body)
    console.log('parsed',parsed)
    let stage = null
    if(parsed == 'Not Started'){
      stage = '1'
    }else if(parsed == 'In Progress'){
      stage = '2'
    }else if(parsed == 'Review'){
      stage = '3'
    }else if(parsed == 'Completed'){
      stage = '4'
    }

     const allTask = await task.findAll({
      where: {softDelete: false, stage },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: contacts,
          as: "customer", // must match the alias
          attributes: ["id", "name", "phone", "amount"],
        },
      ],
    });

      if (allTask.length === 0) {
      return httpError(res, 404, "No tasks found");
    }

    return httpSuccess(res, 200, "Tasks retrieved successfully", allTask);
    
  } catch (error) {
     console.error("Error in getTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
}


const getTaskByStage = async (req, res) => {
  const user = req.user;
  const data  = req.params.data
 let stage = null
  try {

    if(data == 'Not Started'){
      stage = '1'
    }else if(data == 'In Progress'){
      stage = '2'
    }else if(data == 'Completed'){
      stage = '3'
    }

    const allTask = await task.findAll({
      where: { staffId: user.id, softDelete: false, stage },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: contacts,
          as: "customer", // must match the alias
          attributes: ["id", "name", "phone", "amount"],
        },
      ],
    });

    if (allTask.length === 0) {
      return httpError(res, 404, "No tasks found");
    }

    return httpSuccess(res, 200, "Tasks retrieved successfully", allTask);
  } catch (error) {
    console.error("Error in getTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const editTask = async (req, res) => {
  try {
    const user = req.user;
    const taskId = req.params.id;
    const data = req.body;
    // console.log("Editing task with ID:", taskId, "Data:", data);
    const existingTask = await task.findOne({
      where: { id: taskId, staffId: user.id, softDelete: false },
    });
    if (!existingTask) {
      return httpError(res, 404, "Task not found");
    }
    await existingTask.update(data);
    return httpSuccess(res, 200, "Task updated successfully", existingTask);
  } catch (error) {
    console.error("Error in editTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const deleteTask = async (req, res) => {
  try {
    const user = req.user;
    const taskId = req.params.id;
    const existingTask = await task.findOne({
      where: { id: taskId, staffId: user.id },
    });
    
    if (!existingTask) {
      return httpError(res, 404, "Task not found");
    }
    const moment = require("moment-timezone");

    // Get current Indian Railway time (IST)
    const now = moment().tz("Asia/Kolkata");

    const currentDate = now.format("YYYY-MM-DD"); // only date
    const currentTime = now.format("HH:mm:ss");

    await trash.create({
      data: "task",
      dataId: taskId,
      staffId: user.id, // can be null if no staff
      date: currentDate,
      time: currentTime,
      // dateTime will automatically use default: DataTypes.NOW
    });
    await existingTask.update({ softDelete: true });
    return httpSuccess(res, 200, "Task deleted successfully");
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const taskStageUpdate = async (req, res) => {
  try {
    const user = req.user;
    const taskId = req.params.id;
    const data = req.body;

    const existingTask = await task.findOne({
      where: { id: taskId, staffId: user.id },
    });

    if (!existingTask) {
      return httpError(res, 404, "Task not found");
    }
    await existingTask.update({ stage: data.data });
    return httpSuccess(
      res,
      200,
      "Task stage updated successfully",
      existingTask
    );
  } catch (error) {
    console.log("Error in taskStageUpdate:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const getTaskDetails = async (req, res) => {
  try {
    // Validate input
    const { parsed } = req.body;
    if (!parsed || !parsed.data) {
      return httpError(res, 400, "Missing or invalid request body");
    }

    const { taskId, contactId } = parsed.data;
    const user = req.user;

    if (!contactId) {
      return httpError(res, 400, "Missing contactId ");
    }

    // Fetch customer details
    const customerDetails = await contacts.findOne({
      where: { id: contactId, staffId: user.id },
    });
    if (!customerDetails) {
      return httpError(res, 404, "Customer not found for this staff");
    }

    // Fetch related data
    const [meetingDetails, callDetails, taskDetails] = await Promise.all([
      meetings.findAll({
        where: { contactId, staffId: user.id },
      }),
      calls.findAll({
        where: { contactId, staffId: user.id },
      }),
      task.findAll({
        where: { contactId, staffId: user.id },
      }),
    ]);

    // Optionally filter task by taskId if provided
    const filteredTaskDetails = taskId
      ? taskDetails.filter((t) => t.id === Number(taskId))
      : taskDetails;

    // Send response
    return httpSuccess(res, 200, "task details getted successfully", {
      customerDetails,
      meetingDetails,
      callDetails,
      taskDetails: filteredTaskDetails,
    });
  } catch (error) {
    console.error("Error in getTaskDetails:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const updateStagesAndNotes = async (req, res) => {
  try {
    const { data } = req.body;
    const user = req.user;

    const existingTask = await task.findOne({
      where: { id: data.id, staffId: user.id },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found for this user",
      });
    }

    await existingTask.update({
      stage: data.stages,
      notes: data.notes,
    });

    return res.status(200).json({
      success: true,
      message: "Task stage and notes updated successfully",
      data: existingTask,
    });
  } catch (error) {
    console.error("Error in update stages and notes:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};


const getTeamTaskDetails = async (req, res) => {
  try {
    // Validate input
    const { parsed } = req.body;
    // console.log(parsed);

    if (!parsed || !parsed.contactId || !parsed.taskId) {
      return httpError(res, 400, "Missing or invalid request body");
    }

    const { taskId, contactId } = parsed;
    const user = req.user;

    if (!contactId) {
      return httpError(res, 400, "Missing contactId ");
    }

    // Fetch customer details
    const customerDetails = await contacts.findOne({
      where: { id: contactId },
    });

    if (!customerDetails) {
      return httpError(res, 404, "Customer not found");
    }

    // Fetch related data
    const [meetingDetails, callDetails, taskDetails] = await Promise.all([
      meetings.findAll({
        where: { contactId },
      }),
      calls.findAll({
        where: { contactId },
      }),
      task.findAll({
        where: { contactId },
      }),
    ]);

    // Optionally filter task by taskId if provided
    const filteredTaskDetails = taskId
      ? taskDetails.filter((t) => t.id === Number(taskId))
      : taskDetails;

    // Send response
    return httpSuccess(res, 200, "team task details getted successfully", {
      customerDetails,
      meetingDetails,
      callDetails,
      taskDetails: filteredTaskDetails,
    });
  } catch (error) {
    console.error("Error in get team task details:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const updateTeamStagesAndNotes = async (req, res) => {
  try {
    const { data } = req.body;
    const user = req.user;
    // console.log("Input data:", data);

    const existingTask = await task.findOne({ where: { id: data.id } });
    if (!existingTask) return httpError(res, 404, "Task not found");

    if (existingTask.staffId === user.id) {
      await existingTask.update({ stage: data.stages, notes: data.notes });
    } else {
      const teamDetails = await team.findOne({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn(
                "JSON_CONTAINS",
                Sequelize.col("staffIds"),
                JSON.stringify(user.id)
              ),
              1
            ),
            Sequelize.where(
              Sequelize.fn(
                "JSON_CONTAINS",
                Sequelize.col("staffIds"),
                JSON.stringify(existingTask.staffId)
              ),
              1
            ),
          ],
        },
      });
      if (!teamDetails) return httpError(res, 403, "No access");

      const staffDetails = await signup.findOne({ where: { id: user.id } });
      if (!staffDetails) return httpError(res, 404, "Staff not found");

      const fullDetails = `Date: ${
        new Date().toISOString().split("T")[0]
      },    Staff Name: ${staffDetails.name},    Stage: ${
        data.stages
      }, notes: ${data.notes}`;
      const updatedTeamWork = existingTask.teamWork
        ? [...existingTask.teamWork, fullDetails]
        : [fullDetails];

      await existingTask.update({
        stage: data.stages,
        notes: data.notes,
        teamWork: updatedTeamWork,
      });
    }

    await existingTask.reload(); // ensure response has updated data
    return res.status(200).json({
      success: true,
      message: "Task stage and notes updated successfully",
      data: existingTask,
    });
  } catch (error) {
    console.error("Error in update stages and notes:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

//---------------pending task-----------------//

//-----admin---------//

const getPendingTask = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const allPendingTask = await task.findAll({
      where: {
        stage: { [Op.ne]: 4 }, // stages not equal to 4
        softDelete: false,
      },
      include: [
        {
          model: staff,
          attributes: ["id", "staffName"], // only bring required fields
        },
      ],
    });

    return res.status(200).json(allPendingTask);
  } catch (error) {
    console.error("Error in getPendingTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const getTaskDetailForAdmin = async (req, res) => {
  try {
    // Validate input
    const { parsed } = req.body;
    if (!parsed || !parsed.data) {
      return httpError(res, 400, "Missing or invalid request body");
    }

    const { taskId, contactId, staffId } = parsed.data;

    const user = req.user;

    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    if (!contactId) {
      return httpError(res, 400, "Missing contactId ");
    }

    // Fetch customer details
    const customerDetails = await contacts.findOne({
      where: { id: contactId, staffId },
    });
    if (!customerDetails) {
      return httpError(res, 404, "Customer not found for this staff");
    }

    // Fetch related data
    const [meetingDetails, callDetails, taskDetails] = await Promise.all([
      meetings.findAll({
        where: { contactId, staffId },
      }),
      calls.findAll({
        where: { contactId, staffId },
      }),
      task.findAll({
        where: { contactId, staffId },
      }),
    ]);

    // Optionally filter task by taskId if provided
    const filteredTaskDetails = taskId
      ? taskDetails.filter((t) => t.id === Number(taskId))
      : taskDetails;

    // Send response
    return httpSuccess(res, 200, "task details getted successfully", {
      customerDetails,
      meetingDetails,
      callDetails,
      taskDetails: filteredTaskDetails,
    });
  } catch (error) {
    console.error("Error in getting task details for admin:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const updateStagesByAdmin = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const existingTask = await task.findOne({
      where: { id: data.taskId },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found for this user",
      });
    }

    if (existingTask.stage == 4) {
      await existingTask.update({
        stage: "3",
      });
    } else {
      await existingTask.update({
        stage: data.stage,
        rework: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task stage and notes updated successfully",
      data: existingTask,
    });
  } catch (error) {
    console.error("Error in update stages :", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const reworkUpdate = async (req, res) => {
  try {
    const { id } = req.body;

    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const existing = await task.findOne({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // determine new rework value
    const newRework = !existing.rework;

    // build update object
    const updateFields = { rework: newRework };

    // if we are turning rework ON, also reset newUpdate
    if (newRework === true) {
      updateFields.newUpdate = false;
    }

    const updatedTask = await existing.update(updateFields);

    return res.status(200).json({
      success: true,
      message: `Rework set to ${updatedTask.rework}`,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error in updating rework:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};

const newUpdate = async (req, res) => {
  try {
    const { id } = req.body;
    const user = req.user;

    const existing = await task.findOne({ where: { id, staffId: user.id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (existing.staffId == user.id) {
      const updatedTask = await existing.update({
        newUpdate: !existing.newUpdate,
      });
      // Toggle the new update flag

      return res.status(200).json({
        success: true,
        message: `new update set to ${updatedTask.rework}`,
        data: updatedTask,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }
  } catch (error) {
    console.error("Error in updating new Update:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || error,
    });
  }
};


const getTaskForAdmin = async (req, res) => {
  try {
    // Assuming req.user has the logged-in user info
    const user = req.user;

    const access = await roleChecker(user.id);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Fetch all tasks with associated contact and staff details
    const tasks = await task.findAll({
      where: { softDelete: false },
      include: [
        {
          model: contacts, // replace with your contact model
          as: "customer", // make sure your association alias matches
          attributes: ["name", "phone", "email", "amount"],
        },
        {
          model: signup, // replace with your staff model
          as: "staff", // make sure your association alias matches
          attributes: ["name", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
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


const getAdminTask = async (req, res) => {
  try {
    // Assuming req.user has the logged-in user info
    const user = req.user;

    const access = await roleChecker(user.id);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Fetch all tasks with associated contact and staff details
    const tasks = await task.findAll({
      where: { softDelete: false },
      include: [
        {
          model: contacts, // replace with your contact model
          as: "customer", // make sure your association alias matches
          attributes: ["name", "phone", "email", "amount"],
        },
        {
          model: signup, // replace with your staff model
          as: "staff", // make sure your association alias matches
          attributes: ["name", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: tasks,
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
  createTask,
  getTask,
  getTaskByStage,
  editTask,
  deleteTask,
  taskStageUpdate,
  getPendingTask,
  getTaskDetails,
  updateStagesAndNotes,
  getTeamTaskDetails,
  updateTeamStagesAndNotes,
  getTaskDetailForAdmin,
  updateStagesByAdmin,
  reworkUpdate,
  newUpdate,
  getTaskForAdmin,
  getTaskByStatus,
  getAdminTask
};
