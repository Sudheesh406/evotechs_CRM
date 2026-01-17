const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require("../../utils/v1/roleChecker");
const company = require("../../models/v1/company/company");
const signup = require('../../models/v1/Authentication/authModel')
const team = require('../../models/v1/Team_work/team');
const companyProfile = require('../../models/v1/company/companyProfile')
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

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

    // Find existing company (assuming only ONE company record)
    const existingCompany = await company.findOne();

    let companyData;

    if (existingCompany) {
      // 🔹 UPDATE instead of replace
      await existingCompany.update(data);
      companyData = existingCompany;
    } else {
      // 🔹 CREATE only if not exists
      companyData = await company.create(data);
    }

    res.status(200).json({
      success: true,
      message: "Company details saved successfully",
      data: companyData,
    });
  } catch (error) {
    console.error("Error in create/update company details:", error);
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

    const companyImage = await companyProfile.findOne({})

    const data = { companyDetails, adminDetails, staffDetails, companyImage };

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error in getting company details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const profileImageUpload = async (req, res) => {
  try {
    const user = req.user;
  
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    // 📸 Check if file uploaded
    if (!req.file) {
      return httpError(res, 400, "Profile image is required.");
    }

    const fileData = req.file;

    console.log(fileData)

    // 🏢 Find company
    const companyDetails = await company.findOne({});
    if (!companyDetails) {
      return httpError(res, 404, "Company not found.");
    }

    
     const isExist = await companyProfile.findOne({});

    if (isExist) {
      // DELETE old image
      if (isExist.imagePath) {
        const oldPath = path.join(__dirname, "..", "..", "images", isExist.imagePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // UPDATE with new image
      isExist.imagePath = fileData.filename;
      await isExist.save();

      return res.json({
        success: true,
        message: "Image updated successfully",
        data: isExist,
      });
    }

    // 📍 Save to DB
    const newImage = await companyProfile.create({
      adminId: user.id,
      companyId: companyDetails.id,
      imagePath: fileData.filename, // or fileData.filename if storing filename
    });

    return res.status(201).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: newImage,
    });

  } catch (error) {
    console.error("Error in profile image upload:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


module.exports = { createCompany, getCompanyDetails, profileImageUpload };
