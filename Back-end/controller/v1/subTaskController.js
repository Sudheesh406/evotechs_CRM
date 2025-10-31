const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const task = require("../../models/v1/Project/task");
const roleChecker = require("../../utils/v1/roleChecker");
const subTask = require("../../models/v1/Project/subTask");
const contacts = require('../../models/v1/Customer/contacts')
const adminTask = require('../../models/v1/Project/adminTask')

const createSubTask = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    if (
      !data.title ||
      !data.details ||
      !data.taskId ||
      data.details.length === 0
    ) {
      return httpError(res, 400, "Missing required fields: data or id");
    }

    const admin = await roleChecker(user.id);

    if (admin) {

      const parentTask = await adminTask.findOne({
        where: { id: data.taskId, adminId: user.id },
      });
      if (!parentTask) {
        return httpError(res, 404, "task not found");
      }
  
      const newSubTask = await subTask.create({
        staffId: user.id,
        taskId: data.taskId,
        notChecked: data.details,
        title: data.title,
        role : 'admin'
      });
    return httpSuccess(res, 201, "Sub-Task created successfully", newSubTask);
      
    }else{

      const parentTask = await task.findOne({
        where: { id: data.taskId, staffId: user.id },
      });
      if (!parentTask) {
        return httpError(res, 404, "task not found");
      }
  
      const newSubTask = await subTask.create({
        staffId: user.id,
        taskId: data.taskId,
        notChecked: data.details,
        title: data.title,
        role : 'staff'

      });


    return httpSuccess(res, 201, "Sub-Task created successfully", newSubTask);

  }
  } catch (error) {
    console.error("Error in createSubTask:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const getSubTasks = async (req, res) => {
  try {
    const user = req.user;
    const taskId = req.params.id;
    if (!taskId) {
      return httpError(res, 400, "Task ID is required");
    }
    const admin = await roleChecker(user.id);
    let role = ''
    if(admin){
      role = 'admin'
    }else{
      role = 'staff'
    }
    const data = await subTask.findAll({
      where: { staffId: user.id, taskId, role, softDelete: false },
    });
    if (!data) {
      return httpError(res, 404, "No Sub-Task found");
    }

    return httpSuccess(res, 200, "Sub-Tasks fetched successfully", data);
  } catch (error) {
    console.error("Error in getSubTasks:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const getTeamSubTasks = async (req, res) => {
  try {
    const user = req.user;
    const taskId = req.params.id;
    if (!taskId) {
      return httpError(res, 400, "Task ID is required");
    }

      const admin = await roleChecker(user.id);
    let role = ''
    if(admin){
      role = 'admin'
    }else{
      role = 'staff'
    }

    const data = await subTask.findAll({
      where: { taskId, role, softDelete: false },
    });
    if (!data) {
      return httpError(res, 404, "No Sub-Task found");
    }

    return httpSuccess(res, 200, "Sub-Tasks fetched successfully", data);
  } catch (error) {
    console.error("Error in getSubTasks:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const updateSubTasks = async (req, res) => {
  try {
    const user = req.user;
    const subTaskId = req.params.id;
    const data = req.body;

    if (
      !data.title ||
      !subTaskId ||
      !data.details ||
      data.details.length === 0
    ) {
      return httpError(
        res,
        400,
        "Missing required fields: title, details or id"
      );
    }

         const admin = await roleChecker(user.id);
    let role = ''
    if(admin){
      role = 'admin'
    }else{
      role = 'staff'
    }

    const existingSubTask = await subTask.findOne({
      where: { staffId: user.id, id: subTaskId,role, softDelete: false },
    });

    if (!existingSubTask) {
      return httpError(res, 404, "No Sub-Task found");
    }

    const updatedSubTask = await existingSubTask.update({
      title: data.title,
      notChecked: data.details,
    });
    return httpSuccess(
      res,
      200,
      "Sub-Task updated successfully",
      updatedSubTask
    );
  } catch (error) {
    console.error("Error in update SubTasks:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const checkInUpdate = async (req, res) => {
  try {
    const user = req.user;
    const subTaskId = req.params.id;
    const data = req.body;

    if (!subTaskId || !data.name) {
      return httpError(res, 400, "Missing required fields");
    }

    const admin = await roleChecker(user.id);
    let role = ''
    if(admin){
      role = 'admin'
    }else{
      role = 'staff'
    }

    const existingSubTask = await subTask.findOne({
      where: { staffId: user.id, id: subTaskId,role, softDelete: false },
    });

    if (!existingSubTask) {
      return httpError(res, 404, "No Sub-Task found");
    }

    // Ensure checked and notChecked arrays exist
    let checkedArray = Array.isArray(existingSubTask.checked)
      ? [...existingSubTask.checked]
      : [];

    let notCheckedArray = Array.isArray(existingSubTask.notChecked)
      ? [...existingSubTask.notChecked]
      : [];

    // Toggle the value
    if (checkedArray.includes(data.name)) {
      checkedArray = checkedArray.filter((item) => item !== data.name);
      if (!notCheckedArray.includes(data.name)) notCheckedArray.push(data.name);
    } else {
      checkedArray.push(data.name);
      notCheckedArray = notCheckedArray.filter((item) => item !== data.name);
    }

    // Update the sub-task using JSON if stored as ARRAY/JSON in DB
    const result = await existingSubTask.update({
      checked: checkedArray,
      notChecked: notCheckedArray,
    });


    return httpSuccess(res, 200, "Sub-Task check-in updated successfully",result);
  } catch (error) {
    console.error("Error in update SubTasks:", error);
    return httpError(res, 500, "Internal Server Error",error);
  }
};


const deleteSubtask = async (req, res) => {
  try {
    const user = req.user;
    const subTaskId = req.params.id;

    // ✅ Validate ID
    if (!subTaskId) {
      return httpError(res, 400, "Sub-task ID is required");
    }

    const admin = await roleChecker(user.id);
    let role = ''
    if(admin){
      role = 'admin'
    }else{
      role = 'staff'
    }

    // ✅ Find subtask
    const subtask = await subTask.findOne({
      where: { id: subTaskId,role, staffId: user.id },
    });

    if (!subtask) {
      return httpError(res, 404, "No Sub-task found for this user");
    }

    // ✅ Delete subtask
    await subtask.update({softDelete : true});

    return httpSuccess(res, 200, "Sub-task deleted successfully");
  } catch (error) {
    console.error("Error in deleteSubtask:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const deleteNotCheckedData = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const data = req.body;

    if (!id || !data || !data.detail) {
      return httpError(res, 400, "Sub task ID and detail to delete are required");
    }

         const admin = await roleChecker(user.id);
    let role = ''
    if(admin){
      role = 'admin'
    }else{
      role = 'staff'
    }

    const task = await subTask.findOne({ where: { id: id, staffId: user.id, role} });
    if (!task) {
      return httpError(res, 404, "Sub task not found");
    }

    const value = task.notChecked || [];
    const isExist = value.filter((e) => e === data.detail);

    if (isExist.length === 0) {
      return httpError(res, 404, "No matching data found in this sub task");
    }

    // Remove the detail from notChecked array
    const updatedNotChecked = value.filter((e) => e !== data.detail);

    const [updatedRows] = await subTask.update(
      { notChecked: updatedNotChecked },
      { where: { id: id, staffId: user.id } }
    );

    if (updatedRows === 0) {
      return httpError(res, 400, "Failed to update sub task");
    }

    return res.status(200).json({ message: "Detail deleted successfully", notChecked: updatedNotChecked });
  } catch (error) {
    console.error("Error in delete not checked datas:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const getRemovedSubTask = async (req, res) => {
  try {
    const user = req.user;
      const admin = await roleChecker(user.id);
    if(admin){
     const data = await subTask.findAll({ where: { softDelete: true, staffId: user.id } });

      const enrichedData = await Promise.all(
      data.map(async (sub) => {
        // Convert to plain object
        const subObj = sub.get({ plain: true });

        const taskDetails = await adminTask.findOne({ where: { id: subObj.taskId } });
        if (taskDetails) {
          subObj.requirement = taskDetails.taskName;
        }

        return subObj;
      })
    );

    return res.json({ enrichedData, message: "removed sub task fetched successfully" });

    }else{
    // Get all soft-deleted subtasks
    const data = await subTask.findAll({ where: { softDelete: true, staffId: user.id } });

    // Enrich each subtask
    const enrichedData = await Promise.all(
      data.map(async (sub) => {
        // Convert to plain object
        const subObj = sub.get({ plain: true });

        const taskDetails = await task.findOne({ where: { id: subObj.taskId } });
        if (taskDetails) {
          subObj.requirement = taskDetails.requirement;
          const contactDetails = await contacts.findOne({ where: { id: taskDetails.contactId } });
          subObj.customerName = contactDetails ? contactDetails.name : null;
        }

        return subObj;
      })
    );
    return res.json({ enrichedData, message: "removed sub task fetched successfully" });
  }

  } catch (error) {
    console.error("Error in getting removed sub task :", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


 const restoreSubtask = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    if (!id) {
      return httpError(res, 400, "Sub task ID is required");
    }

    const subtask = await subTask.findOne({ where: { id } });

    if (!subtask) {
      return httpError(res, 404, "No Sub-task found for this user");
    }

    // Restore the sub-task
    await subtask.update({ softDelete: false });

    return res.status(200).json({
      success: true,
      message: "Sub-task restored successfully",
      data: subtask,
    });
  } catch (error) {
    console.error("Error in restore sub task:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


 const permanentDeleteSubtask = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    if (!id) {
      return httpError(res, 400, "Sub task ID is required");
    }

    const subtask = await subTask.findOne({ where: { id } });

    if (!subtask) {
      return httpError(res, 404, "No Sub-task found for this user");
    }

    // Restore the sub-task
    await subtask.destroy();

    return res.status(200).json({
      success: true,
      message: "Sub-task restored successfully",
      data: subtask,
    });
  } catch (error) {
    console.error("Error in restore sub task:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


module.exports = {
  createSubTask,
  getSubTasks,
  updateSubTasks,
  checkInUpdate,
  deleteSubtask,
  deleteNotCheckedData,
  getTeamSubTasks,
  getRemovedSubTask,
  restoreSubtask,
  permanentDeleteSubtask
};
