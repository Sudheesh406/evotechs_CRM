const { Sequelize, Op, fn, col, where } = require("sequelize");
const task = require("../../models/v1/Project/task");
const contacts = require("../../models/v1/Customer/contacts");
const signup = require("../../models/v1/Authentication/authModel");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const requirement = require("../../models/v1/Project/requirements");
const document = require("../../models/v1/Project/documents");
const team = require("../../models/v1/Team_work/team");
const documents = require("../../models/v1/Project/documents");

const getRequirementDocument = async (req, res) => {
  try {
    const user = req.user; // make sure req.user is available
    const id = req.params.id;
    const access = roleChecker(user.id);

    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const taskDetails = await task.findOne({ where: { id: id } });
    const requirementData = taskDetails.requirement;
    const requirementDetails = await requirement.findOne({
      where: { project: requirementData },
    });
    const projectName = requirementDetails.project;
    const data = requirementDetails.data;

    const documentDetails = await document.findOne({
      where: {
        [Op.or]: [
          { staffId: user.id, taskId: id },
          { TeamStaffId: user.id, taskId: id },
        ],
      },
    });

    const result = { projectName, data, documentDetails };
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in getting requirment in documents:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

const documentCreate = async (req, res) => {
  try {
    const { requirements, url, description, documentId } = req.body;
    const { id: taskId } = req.params;
    const user = req.user;

    // 1️⃣ Validate inputs
    if (!taskId || !requirements || !Array.isArray(requirements)) {
      return httpError(res, 400, "Task ID and requirements are required");
    }

    // 2️⃣ Fetch task details
    const taskDetails = await task.findOne({ where: { id: taskId } });
    if (!taskDetails) {
      return httpError(res, 404, "Task not found");
    }

    // 3️⃣ Check ownership or team permission
    let canCreate = false;
    const documentPayload = {
      requirements,
      taskId,
      url,
      description,
    };

    if (taskDetails.staffId === user.id) {
      // User is task owner
      canCreate = true;
      documentPayload.staffId = user.id;
    } else {
      // Check if user and owner are in the same team

      const teams = await team.findAll({
        where: Sequelize.where(
          Sequelize.fn(
            "JSON_CONTAINS",
            Sequelize.col("staffIds"),
            JSON.stringify(taskDetails.staffId) // check for owner's ID
          ),
          1
        ),
      });

      if (teams.length > 0) {
        canCreate = true;
        documentPayload.TeamStaffId = user.id;
      }
    }

    if (!canCreate) {
      return httpError(
        res,
        403,
        "You are not allowed to create/update documents for this task"
      );
    }

    // 4️⃣ Create or update document
    let result;
    if (documentId) {
      // Update existing document
      const documentDetails = await document.findOne({
        where: { id: documentId },
      });
      if (documentDetails) {
        result = await documentDetails.update(documentPayload);
      } else {
        // If documentId is invalid, create new
        result = await document.create(documentPayload);
      }
    } else {
      // Create new document
      result = await document.create(documentPayload);
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("❌ Error in create/update documents:", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

module.exports = {
  getRequirementDocument,
  documentCreate,
};
