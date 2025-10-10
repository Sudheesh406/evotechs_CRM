const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const task = require("../../models/v1/Project/task");
const roleChecker = require("../../utils/v1/roleChecker");
const subTask = require("../../models/v1/Project/subTask");

const createSubTask = async (req, res) => {
  try {
    const user = req.user;
    const {data} = req.body;

    console.log("datda:", data);

   if (!data.title || !data.details || !data.taskId || data.details.length === 0) {
        return httpError(res, 400, "Missing required fields: data or id");
    }

    const admin = await roleChecker(user.id);
    console.log("admin:", admin);
    if(admin){
       httpError(res,403,"Only Staff can create Sub-Task")
    }

    const parentTask = await task.findOne({ where: { id: data.taskId, staffId: user.id } });
    if (!parentTask) {
        return httpError(res, 404, "task not found");
    }


    const newSubTask = await subTask.create({
        staffId: user.id,
        taskId: data.taskId,
        notChecked: data.details,
        title: data.title,
    });

    return httpSuccess(res, 201, "Sub-Task created successfully", newSubTask);

  } catch (error) {
    console.error("Error in createSubTask:", error);
    return httpError(res, 500, "Internal Server Error");
  }
}


const getSubTasks = async (req, res) => {
  try {
    const user = req.user;
    const taskId = req.params.id;
    if(!taskId){
        return httpError(res,400,"Task ID is required")
    }

    const data = await subTask.findAll({where:{staffId:user.id,taskId,softDelete:false}});
    if(!data){
        return httpError(res,404,"No Sub-Task found")
    }

    console.log("data:", data);

  return httpSuccess(res, 200, "Sub-Tasks fetched successfully", data);
    
  } catch (error) {
    console.error("Error in getSubTasks:", error);
    return httpError(res, 500, "Internal Server Error");
  }
}


//--------------------- here is the spott to update -----------------------//

//----------------- pending in subTask ------------------//

  module.exports = {
    createSubTask,
    getSubTasks
  };