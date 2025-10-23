const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const company = require("../../models/v1/company/company");
const signup = require('../../models/v1/Authentication/authModel')
const team = require('../../models/v1/Team_work/team')
const { Op } = require("sequelize");

const createCompany = async (req, res) => {
  try {
    const data = { ...req.body };
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // Convert empty strings for numeric fields to null
    const numericFields = ["employeeCount", "foundedYear"];
    numericFields.forEach((field) => {
      if (data[field] === "") data[field] = null;
    });

    // Optional: If you want to delete existing company records before creating a new one
    await company.destroy({ where: {}, truncate: true });

    const companyData = await company.create(data);
    res.status(201).json({ success: true, data: companyData });
  } catch (error) {
    console.error("Error in create company details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getCompanyDetails = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const companyDetails = await company.findOne({});

    // Fetch staff members
    const staffDetailsRaw = await signup.findAll({
      where: { role: "staff", verified: 'false' },
      attributes: ["id", "name", "email"], // Include id for team matching
    });

    // Fetch all teams
    const allTeams = await team.findAll({
      attributes: ["teamName", "staffIds"],
    });

    // Map staff to their teams
    const staffDetails = staffDetailsRaw.map((staff) => {
      const staffTeams = allTeams
        .filter((t) => t.staffIds.includes(staff.id)) // Check if staffId exists in team
        .map((t) => t.teamName);

      return {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        teams: staffTeams, // Add array of team names
      };
    });

    const adminDetails = await signup.findAll({
      where: { role: "admin" },
      attributes: ["name", "email"],
    });

    const data = { companyDetails, adminDetails, staffDetails };

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error in getting company details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = { createCompany, getCompanyDetails };
