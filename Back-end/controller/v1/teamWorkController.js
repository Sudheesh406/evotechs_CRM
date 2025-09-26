const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const team = require("../../models/v1/Team_work/team");
const teamHistory = require("../../models/v1/Team_work/teamManagementHistory");
const requirement = require("../../models/v1/Project/requirements");
const leads = require("../../models/v1/Customer/leads");
const task = require("../../models/v1/Project/task");
const { contacts } = require("../../models/v1");
const { signup } = require("../../models/v1");

const { Op, fn, col, literal, Sequelize  } = require("sequelize");

const createTeamWork = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied");
    }

    // Validation (teamName + staffIds required)
    if (
      !data.teamName ||
      !Array.isArray(data.staffIds) ||
      data.staffIds.length === 0
    ) {
      return httpError(res, 400, "Missing required fields");
    }

    // Clean staffIds
    const ids = data.staffIds.filter((id) => id);

    const newTeam = await team.create({
      teamName: data.teamName,
      teamDescription: data.teamDescription || "",
      leaderId: data.leaderId || null,
      staffIds: ids,
      createdAdminId: user.id,
    });

    if (!newTeam) {
      return httpError(res, 500, "Failed to create team work");
    }

    return httpSuccess(res, 201, "Team work created successfully", newTeam);
  } catch (error) {
    console.error("Error creating team work:", error);
    return httpError(res, 500, "Failed to create team work");
  }
};

const getTeam = async (req, res) => {
  try {
    const user = req.user;

    // Check if the user has access
    const hasAccess = await roleChecker(user.id);
    if (!hasAccess) {
      return httpError(
        res,
        403,
        "Access denied: You do not have permission to view teams"
      );
    }

    // Fetch all teams that are not soft deleted
    const teams = await team.findAll({
      where: { softDelete: false },
      order: [["createdAt", "DESC"]],
    });

    // Fetch staff details for each team
    const teamsWithStaffDetails = await Promise.all(
      teams.map(async (t) => {
        // Assuming staffIds is an array of staff IDs in each team
        const staffList = await signup.findAll({
          where: {
            id: t.staffIds, // Sequelize handles array with IN query
          },
          attributes: ["id", "name", "email"], // Only fetch required fields
        });

        return {
          ...t.dataValues,
          staffDetails: staffList, // Add staff details to team
        };
      })
    );

    return httpSuccess(
      res,
      200,
      "Teams fetched successfully",
      teamsWithStaffDetails
    );
  } catch (error) {
    console.error("Error in getTeam:", error);
    return httpError(res, 500, "Failed to fetch teams");
  }
};

const getStaff = async (req, res) => {
  try {
    const user = req.user;

    // Check if the user has permission to access staff data
    const hasAccess = await roleChecker(user.id);
    if (!hasAccess) {
      return httpError(
        res,
        403,
        "Access denied: You do not have permission to view staff."
      );
    }

    // Fetch all staff users
    const staffList = await signup.findAll({
      where: { role: "staff" },
      attributes: ["id", "name", "email"], // select only necessary fields
    });

    return httpSuccess(res, 200, "Staff fetched successfully", staffList);
  } catch (error) {
    console.error("Error in getStaff:", error);
    return httpError(
      res,
      500,
      "Failed to fetch staff. Please try again later."
    );
  }
};

const editTeam = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    const id = req.params.id;

    const hasAccess = await roleChecker(user.id);
    if (!hasAccess) {
      return httpError(
        res,
        403,
        "Access denied: do not have permission to edit team."
      );
    }

    if (
      !data ||
      !data.teamName ||
      !data.teamDescription ||
      !data.staffIds ||
      !Array.isArray(data.staffIds) ||
      data.staffIds.length <= 0
    ) {
      return httpError(res, 400, "Missing required fields");
    }

    if (data.leaderId == 0) {
      data.leaderId = null;
    }
    const existingTeam = await team.findOne({ where: { id } });
    if (!existingTeam) {
      return httpError(res, 404, "Team not found");
    }

    const updatedData = await existingTeam.update(data);
    return httpSuccess(res, 200, "Team updated successfully", updatedData);
  } catch (error) {
    console.log("error found in edit team", error);
    return httpError(res, 500, "Failed to edit team. Please try again later.");
  }
};

const deleteTeam = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    const hasAccess = await roleChecker(user.id);
    if (!hasAccess) {
      return httpError(
        res,
        403,
        "Access denied: do not have permission to delete team."
      );
    }
    // Find team by id
    const dataForDelete = await team.findOne({
      where: { id, softDelete: false },
    });
    if (!dataForDelete) {
      return httpError(res, 404, "Team not found");
    }

    // Soft delete by updating the field
    const deletedData = await dataForDelete.update({ softDelete: true });

    return httpSuccess(res, 200, "Team deleted successfully", deletedData);
  } catch (error) {
    console.log("error found in delete team", error);
    return httpError(
      res,
      500,
      "Failed to delete team. Please try again later."
    );
  }
};

//----------------------staff----------------------//

const getTeamDetails = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return httpError(res, 401, "Unauthorized");
    }

    // Fetch all teams
    const allTeams = await team.findAll({
      where: {
        softDelete: false,
      },
    });

    // Filter teams where current staff is a member
    const userTeams = await Promise.all(
      allTeams
        .filter((t) => t.staffIds.includes(userId))
        .map(async (t) => {
          // Fetch all members' details
          const members = await signup.findAll({
            where: {
              id: t.staffIds,
            },
            attributes: ["id", "name", "email"], // only pick id, name, email
          });

          return {
            ...t.dataValues, // or t.toJSON()
            members, // full details of team members
          };
        })
    );

    return httpSuccess(res, 200, "Teams fetched successfully", userTeams);
  } catch (error) {
    console.log("error found in getTeamDetails", error);
    return httpError(
      res,
      500,
      "Failed to fetch team details. Please try again later."
    );
  }
};

const postTeamHistory = async (req, res) => {
  try {
    const { selectedTeam } = req.body;
    const staff = req.user;

    if (!selectedTeam?.id) {
      return httpError(res, 400, "No team selected");
    }

    // Check if team exists
    const existingTeam = await team.findOne({ where: { id: selectedTeam.id } });
    if (!existingTeam) {
      return httpError(res, 404, "Team not found");
    }

    const acess = await signup.findOne({ where: { id: staff.id } });
    if (acess && acess.role != "admin") {
      // Check if staff belongs to this team
      const staffIds = existingTeam.staffIds; // must be array or null
      if (!Array.isArray(staffIds) || !staffIds.includes(staff.id)) {
        return httpError(res, 403, "Staff is not part of this team");
      }
    }

    await teamHistory.destroy({
      where: { staffId: staff.id },
    });

    // Create team history
    const history = await teamHistory.create({
      teamName: selectedTeam.name,
      description: selectedTeam.description || "",
      staffId: staff.id,
      teamId: selectedTeam.id,
    });

    if (!history) {
      return httpError(res, 500, "Failed to create team history");
    }

    return httpSuccess(res, 201, "Team history created successfully", history);
  } catch (error) {
    console.error("Error in postTeamHistory:", error);
    return httpError(
      res,
      500,
      "Failed to create team history. Please try again later."
    );
  }
};

const getSectors = async (req, res) => {
  try {
    const user = req.user;

    // Get the user's team history
    const history = await teamHistory.findOne({ where: { staffId: user.id } });
    if (!history) {
      return res
        .status(404)
        .json({ message: "No history found for this user" });
    }
    const teamId = history.teamId;

    // Get the team details
    const teamDetails = await team.findOne({
      where: { id: teamId, softDelete: false },
    });
    if (!teamDetails) {
      return res.status(404).json({ message: "Team not found" });
    }

    const staffIds = teamDetails.staffIds; // array of staff IDs

    // Fetch all requirements for these staff IDs
    const requirements = await requirement.findAll({
      where: {
        staffId: {
          [Op.in]: staffIds,
        },
      },
    });

    // Remove duplicates by project
    const uniqueRequirements = [];
    const seenProjects = new Set();

    requirements.forEach((req) => {
      const project = req.project || req.dataValues.project; // depending on raw option
      if (!seenProjects.has(project)) {
        seenProjects.add(project);
        uniqueRequirements.push(req);
      }
    });

    return res.json({ team: teamDetails, requirements: uniqueRequirements });
  } catch (error) {
    console.log("Error in getSectors:", error);
    return httpError(
      res,
      500,
      "Failed to get sectors. Please try again later."
    );
  }
};

const getProjects = async (req, res) => {
  try {
    const user = req.user;
    const { parsedData } = req.body;
    const { staffIds, projectName } = parsedData;

    if (!Array.isArray(staffIds) || staffIds.length === 0) {
      return res
        .status(400)
        .json({ message: "staffIds must be a non-empty array" });
    }

    const whereCondition = {
      staffId: { [Op.in]: staffIds },
    };
    if (projectName) {
      whereCondition.requirement = projectName; // or actual column name
    }

    const tasks = await task.findAll({
      where: whereCondition,
      include: [
        {
          model: signup,
          as: "staff",
          attributes: ["name", "email"], // select only name & email
        },
        {
          model: contacts,
          as: "customer",
        },
      ],
    });

    let admin = null;
    const access = await roleChecker(user.id);
    if (access) {
      admin = true;
    }

    return res.status(200).json({ tasks, admin });
  } catch (error) {
    console.error("error found in getting projects", error);
    return httpError(
      res,
      500,
      "Failed to get projects. Please try again later."
    );
  }
};


const getLeads = async (req, res) => {
  try {
    const user = req.user;

    // Find all teams that include the current user
    const allTeams = await team.findAll({
      where: fn("JSON_CONTAINS", col("staffIds"), JSON.stringify(user.id)),
    });

    // Collect all unique staff IDs from these teams
    const allStaffIds = [...new Set(allTeams.flatMap((t) => t.staffIds || []))];

    if (!allStaffIds.length) {
      return res.status(200).json({ leads: [] });
    }

    // Fetch all leads for these staff IDs
    const allLeads = await leads.findAll({
      where: {
        staffId: allStaffIds,
        softDelete: false,
        phone: {
          [Op.notIn]: Sequelize.literal("(SELECT phone FROM contacts)"),
        },
      },
      include: [
        {
          model: signup,
          as: "assignedStaff",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    // console.log(allLeads);

    return res.status(200).json({ leads: allLeads, userId: user.id });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return httpError(res, 500, "Failed to get leads. Please try again later.");
  }
};


const getContacts = async (req, res) => {
  try {
    const user = req.user;

    // Find all teams that include the current user
    const allTeams = await team.findAll({
      where: fn("JSON_CONTAINS", col("staffIds"), JSON.stringify(user.id)),
    });

    // Collect all unique staff IDs from these teams
    const allStaffIds = [...new Set(allTeams.flatMap((t) => t.staffIds || []))];

    if (!allStaffIds.length) {
      return res.status(200).json({ contacts: [] });
    }

    // Fetch all contacts for these staff IDs
    const allContacts = await contacts.findAll({
      where: {
        staffId: allStaffIds,
        softDelete: false,
      },
      include: [
        {
          model: signup,
          as: "assignedStaff",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({ contacts: allContacts, userId: user.id });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return httpError(res, 500, "Failed to get leads. Please try again later.");
  }
};


const contactReassign = async (req, res) => {
  try {
    const user = req.user; // Logged-in user
    const { phone } = req.body;

    if (!phone) {
      return httpError(res, 400, "Phone number is required for reassignment.");
    }

    // Find the contact by phone
    const existing = await contacts.findOne({ where: { phone } });

    if (!existing) {
      return httpError(res, 404, "Contact not found.");
    }

    // Reassign the contact
    existing.staffId = user.id;
    await existing.save(); // Save the change in DB

    return httpSuccess(res, 200, "Contact reassigned successfully", existing);
  } catch (error) {
    console.error("Error reassigning contacts:", error);
    return httpError(res, 500, "Failed to reassign contacts. Please try again later.");
  }
};


module.exports = {
  createTeamWork,
  getTeam,
  getStaff,
  editTeam,
  deleteTeam,
  getTeamDetails,
  postTeamHistory,
  getSectors,
  getProjects,
  getLeads,
  getContacts,
  contactReassign
};
