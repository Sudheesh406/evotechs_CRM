const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const team = require("../../models/v1/Team_work/team");
const { signup } = require("../../models/v1");

const createTeamWork = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    console.log(data);

    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied");
    }

    // Validation (teamName + staffIds required)
    if (!data.teamName || !Array.isArray(data.staffIds) || data.staffIds.length === 0) {
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
    console.log(data)

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

    if(data.leaderId == 0){
        data.leaderId = null
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
    const dataForDelete = await team.findOne({ where: { id, softDelete: false } });
    if (!dataForDelete) {
      return httpError(res, 404, "Team not found");
    }

    // Soft delete by updating the field
    const deletedData = await dataForDelete.update({ softDelete: true });

    return httpSuccess(res, 200, "Team deleted successfully", deletedData);

  } catch (error) {
    console.log("error found in delete team", error);
    return httpError(res, 500, "Failed to delete team. Please try again later.");
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
    const allTeams = await team.findAll();

    // Filter teams where current staff is a member
    const userTeams = await Promise.all(
      allTeams
        .filter(t => t.staffIds.includes(userId))
        .map(async t => {
          // Fetch all members' details
          const members = await signup.findAll({
            where: {
              id: t.staffIds
            },
            attributes: ['id', 'name', 'email'] // only pick id, name, email
          });

          return {
            ...t.dataValues, // or t.toJSON()
            members // full details of team members
          };
        })
    );

    return httpSuccess(res, 200, "Teams fetched successfully", userTeams);

  } catch (error) {
    console.log('error found in getTeamDetails', error);
    return httpError(res, 500, "Failed to fetch team details. Please try again later.");
  }
};





module.exports = { createTeamWork, getTeam, getStaff, editTeam, deleteTeam, getTeamDetails };
