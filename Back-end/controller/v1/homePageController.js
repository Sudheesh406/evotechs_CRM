const Pipeline = require("../../models/v1/Work_space/pipelineModal");
const { Op, fn, col } = require("sequelize");
const sequelize = require("../../database/dbConfigue").sequelize;
const fs = require("fs");
const path = require("path");
const pipelineDetails = require("../../models/v1/Work_space/PipelineDetails");
const signup = require("../../models/v1/Authentication/authModel");
const profileImage = require("../../models/v1/Work_space/ProfileImage");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const roleChecker = require('../../utils/v1/roleChecker');
const task = require("../../models/v1/Project/task");


const savePipeline = async (req, res) => {
  try {
    const { nodes, edges, name } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({ message: "Missing nodes or edges" });
    }

    // 🔥 Delete all existing pipelines first
    await Pipeline.destroy({ where: {} });

    // Create new one
    const saved = await Pipeline.create({
      name: name || "My Pipeline",
      data: { nodes, edges },
    });

    res.status(200).json({
      message: "Pipeline replaced successfully",
      pipelineId: saved.id,
    });
  } catch (error) {
    console.error("Save Pipeline Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findOne();
    if (!pipeline) {
      return res.status(404).json({ message: "No pipeline found" });
    }
    res.status(200).json({ pipeline });
  } catch (error) {
    console.error("error in getting pipeline details:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const CreateConnection = async (req, res) => {
  try {
    const { leadId, teamIds } = req.body;
    const user = req.user;

    const isExisting = await pipelineDetails.findOne({
      where: {
        leadId: leadId,
      },
    });
    if (isExisting) {
      await isExisting.update({
        teamIds: teamIds,
        createdAdminId: user.id,
      });
      res.status(200).json({ message: "Connection Updated Successfully" });
    } else {
      await pipelineDetails.create({
        leadId: leadId,
        teamIds: teamIds,
        createdAdminId: user.id,
      });
      res.status(200).json({ message: "Connection Created Successfully" });
    }
  } catch (error) {
    console.error("error in creating connection:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const GetPipelineConnections = async (req, res) => {
  // try {
  //   // Fetch all pipelines (raw list)
  //   const pipelines = await pipelineDetails.findAll();
  //   const result = [];
  //   for (const pipeline of pipelines) {
  //     const data = pipeline.toJSON();
  //     // -----------------------
  //     // 1. Fetch Lead User
  //     // -----------------------
  //     let leadInfo = null;
  //     if (data.leadId) {
  //       leadInfo = await signup.findOne({
  //         where: { id: data.leadId },
  //         attributes: ["id", "name", "email"]
  //       });
  //     }
  //     // -----------------------
  //     // 2. Fetch Team Members
  //     // -----------------------
  //     const teamIds = Array.isArray(data.teamIds) ? data.teamIds : [];
  //     const teamMembers = await signup.findAll({
  //       where: { id: teamIds },
  //       attributes: ["id", "name", "email"]
  //     });
  //     // -----------------------
  //     // 3. Push Final Result
  //     // -----------------------
  //     result.push({
  //       ...data,
  //       leadInfo,
  //       teamMembers
  //     });
  //   }
  //   res.status(200).json({ pipelines: result });
  // } catch (error) {
  //   console.log("Error fetching pipeline:", error);
  //   res.status(500).json({ message: "Internal Server Error", error });
  // }
};

const GetStaffList = async (req, res) => {
  try {
    const staffList = await signup.findAll({
      attributes: { exclude: ["password"] }, // remove password
    });

    return res.status(200).json({ staff: staffList });
  } catch (error) {
    console.log("Error fetching staff list:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

const GraphData = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error in GraphData:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getStaffDetails = async (req, res) => {
  try {
    const staffDetails = await signup.findAll({
      where: { role: "staff" },
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({ staffDetails });
  } catch (error) {
    console.error("Error fetching staff details:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


const profileUpload = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    const image = req.file;

   const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    if (!data.id || !image) {
      return httpError(res, 400, "Staff ID and image are required");
    }

    const isExist = await profileImage.findOne({
      where: { staffId: data.id },
    });

    if (isExist) {
      // DELETE old image
      if (isExist.imagePath) {
        const oldPath = path.join(__dirname, "..", "..", "images", isExist.imagePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // UPDATE with new image
      isExist.imagePath = image.filename;
      await isExist.save();

      return res.json({
        success: true,
        message: "Image updated successfully",
        data: isExist,
      });
    }

    const newEntry = await profileImage.create({
      staffId: data.id,
      imagePath: image.filename,
      name: data.name,
      email: data.email,
    });

    return res.json({
      success: true,
      message: "Profile image uploaded successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error in profileUpload:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const getStaffProfile = async (req, res) => {
  try {
    // 1️⃣ Get all staff
    const staffList = await profileImage.findAll({
      attributes: ["id", "staffId", "name", "email", "imagePath"],
      order: [["id", "ASC"]], // ascending order
      raw: true,
    });

    // 2️⃣ Fetch task counts grouped by staffId and stage
    const taskCounts = await task.findAll({
      attributes: [
        "staffId",
        "stage",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { softDelete: 0 }, // exclude deleted tasks
      group: ["staffId", "stage"],
      raw: true,
    });

    // 3️⃣ Map task counts by staffId
    const taskMap = {};
    taskCounts.forEach((row) => {
      const staffId = row.staffId;
      const stage = Number(row.stage);
      const count = Number(row.count);

      if (!taskMap[staffId]) {
        taskMap[staffId] = { stage1: 0, stage2: 0, stage3: 0, stage4: 0 };
      }

      if (stage >= 1 && stage <= 4) {
        taskMap[staffId][`stage${stage}`] = count;
      }
    });

    // 4️⃣ Combine staff info with task counts
    const formatted = staffList.map((staff) => {
      const counts = taskMap[staff.staffId] || {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0,
      };

      return {
        id: staff.id,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        imageUrl: staff.imagePath,
        taskCounts: {
          ...counts,
          total: counts.stage1 + counts.stage2 + counts.stage3 + counts.stage4,
        },
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error in getStaffProfile:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};




module.exports = {
  savePipeline,
  getPipeline,
  CreateConnection,
  GetPipelineConnections,
  GetStaffList,
  GraphData,
  getStaffDetails,
  profileUpload,
  getStaffProfile,
  
};
