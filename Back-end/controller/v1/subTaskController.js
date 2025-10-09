const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const task = require("../../models/v1/Project/task");
const roleChecker = require("../../utils/v1/roleChecker");
const subTask = require("../../models/v1/Project/subTask");

const createSubTask = async (req, res) => {
  try {
    const user = req.user;
    const {data} = req.body;
    const {id} = req.params;

    if (!data || !id) {
        return httpError(res, 400, "Missing required fields: data or id");
    }

    const admin = roleChecker(user.id);
    if(admin){
            httpError(res,403,"Only Staff can create Sub-Task")
    }


    const parentTask = await task.findOne({ where: { id: id, staffId: user.id } });
    if (!parentTask) {
        return httpError(res, 404, "task not found");
    }
    // const newSubTask = await subTask.create({
    //     requirement: parentTask.requirement,
    //     phone: parentTask.phone,
    // });

  } catch (error) {
    console.error("Error in createSubTask:", error);
    return httpError(res, 500, "Internal Server Error");
  }
}

//----------------- pending in subTask ------------------//

  module.exports = {
    createSubTask,
  };