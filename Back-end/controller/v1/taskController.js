
const { httpSuccess,httpError} = require('../../utils/v1/httpResponse')
const contacts = require('../../models/v1/Customer/contacts')
const task = require('../../models/v1/Project/task');
const roleChecker = require('../../utils/v1/roleChecker');

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
      return httpError(res, 400, "Contact not found. Cannot create task without a contact.");
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
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: contacts,
          as: 'customer', // must match the alias
          attributes: ['id', 'name', 'phone', 'amount'],
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
    console.log("Editing task with ID:", taskId, "Data:", data);
    const existingTask = await task.findOne({ where: { id: taskId, staffId: user.id, softDelete: false } });
    if (!existingTask) {
      return httpError(res, 404, "Task not found");
    }
    await existingTask.update(data);
    return httpSuccess(res, 200, "Task updated successfully", existingTask);
  } catch (error) {
    console.error("Error in editTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
}


const deleteTask = async (req,res)=>{
  try {
    const user = req.user;
    const taskId = req.params.id;
    const existingTask = await task.findOne({ where: { id: taskId, staffId: user.id} });
    if (!existingTask) {
      return httpError(res, 404, "Task not found");
    }  
    await existingTask.update({softDelete:true});
    return httpSuccess(res, 200, "Task deleted successfully");
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
}

const taskStageUpdate = async (req,res)=>{
  try {
    const user = req.user;
    const taskId = req.params.id;
    const data = req.body;
    const existingTask = await task.findOne({ where: { id: taskId, staffId: user.id} });
    if (!existingTask) {
      return httpError(res, 404, "Task not found");
    }
    console.log(existingTask.stage, data.data);
    await existingTask.update({ stage: data.data });
    return httpSuccess(res, 200, "Task stage updated successfully", existingTask);
  } catch (error) {
    console.log("Error in taskStageUpdate:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
}

//---------------pending task-----------------//

//-----admin---------//

const getPendingTask = async (req, res) => {
  try {
    const user = req.user;
    const access = roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const allPendingTask = await task.findAll({
      where: { stage: "pending", softDelete: false },
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




module.exports = {createTask, getTask, editTask, deleteTask, taskStageUpdate, getPendingTask}

