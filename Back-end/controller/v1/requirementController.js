const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const requirement = require("../../models/v1/Project/requirements");
const task = require('../../models/v1/Project/task')
const trash = require('../../models/v1/Trash/trash')
const { Op } = require("sequelize");

const createRequirement = async (req, res) => {
  try {
    const user = req.user;
    const { data, project } = req.body;

    // Validate required fields
    if (!project || !data.lenght <= 0) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
    const existingRequirement = await requirement.findOne({
      where: { project, staffId: user.id },
    });

    if (existingRequirement) {
      return httpError(
        res,
        409,
        "A requirement with this project already exists"
      );
    }

    // Create the lead
    const result = await requirement.create({
      project,
      data,
      staffId: user?.id,
    });

    return httpSuccess(res, 201, "requirement created successfully", result);
  } catch (err) {
    console.error("Error in createRequirement:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};


const getRequirement = async (req, res) => {
  try {
    const user = req.user;

    const existingRequirements = await requirement.findAll({
      where: { staffId: user.id, softDelete: false },
    });

    if (!existingRequirements) {
      return httpError(res, 409, "requirements is not exists");
    }

    return httpSuccess(
      res,
      201,
      "requirements getted successfully",
      existingRequirements
    );
  } catch (error) {
    console.error("Error in getRequirement:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};


const editRequirement = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const data = req.body;

    if (!data || !id) {
      return httpError(res, 400, "Data and ID are required");
    }

    // Find the existing requirement by ID and staff
    const existingRequirement = await requirement.findOne({
      where: { id: id, staffId: user.id },
    });

    if (!existingRequirement) {
      return httpError(res, 403, "Access denied or requirement not found");
    }

    // Check if another requirement already has the same project name
    if (data.project) {
      const duplicate = await requirement.findOne({
        where: {
          project: data.project,
          staffId: user.id,
          id: { [Op.ne]: id }, // exclude the current requirement
        },
      });

      if (duplicate) {
        return httpError(
          res,
          409,
          "You already have a requirement with this project"
        );
      }
    }

    // Update the requirement
    const updatedRequirement = await existingRequirement.update(data);

    return httpSuccess(
      res,
      200,
      "Requirement updated successfully",
      updatedRequirement
    );
  } catch (error) {
    console.error("Error in editRequirement:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};


const deleteRequirement = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    if (!id) {
      return httpError(res, 400, "ID is required");
    }

    const existingRequirement = await requirement.findOne({
      where: { id: id, staffId: user.id },
    });

    if (!existingRequirement) {
      return httpError(res, 404, "Requirement not found");
    }

    const taskDetails = await task.findOne({where:{requirement: existingRequirement.project }})
     if(taskDetails){
      return httpError(res, 406, "A Task is created in this contact");
     }

    const moment = require("moment-timezone");

    // Get current Indian Railway time (IST)
    const now = moment().tz("Asia/Kolkata");

    const currentDate = now.format("YYYY-MM-DD"); // only date
    const currentTime = now.format("HH:mm:ss");

    await trash.create({
      data: "projects",
      dataId: id,
      staffId: user.id, // can be null if no staff
      date: currentDate,
      time: currentTime,
      // dateTime will automatically use default: DataTypes.NOW
    });

    const deletedRequirement = await existingRequirement.update({
      softDelete: true,
    });

    return httpSuccess(
      res,
      200,
      "Requirement deleted successfully",
      deletedRequirement
    );
  } catch (error) {
    console.error("Error in deleteRequirement:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

module.exports = {
  createRequirement,
  getRequirement,
  editRequirement,
  deleteRequirement,
};
