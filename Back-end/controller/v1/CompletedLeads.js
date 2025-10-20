const leads = require("../../models/v1/Customer/leads");
const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const { Op } = require("sequelize");
const {signup} = require("../../models/v1")
const roleChecker = require('../../utils/v1/roleChecker')

const getCompletedLeads = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic where condition
    const whereCondition = {
      staffId: user.id,
      softDelete: false, // ✅ only fetch non-deleted leads
      priority: "Client", // ✅ only leads with priority = 'Client'
    };

    if (search.trim()) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await leads.findAndCountAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return httpSuccess(res, 200, "Client Leads fetched successfully", {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      leads: rows,
    });
  } catch (error) {
    console.error("Error in getting Leads", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

const getGlobalCompletedLeads = async (req, res) => {
  try {
    const user = req.user;
    const access = await roleChecker(user.id);
    if (!access) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic where condition
    const whereCondition = {
      softDelete: false, // ✅ only fetch non-deleted leads
      priority: "Client", // ✅ only leads with priority = 'Client'
    };

    if (search.trim()) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // ✅ Include staff model to get staffName
    const { count, rows } = await leads.findAndCountAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: signup,
          as: "assignedStaff", // ✅ use the same alias defined in association
          attributes: ["id", "name", "role"], // only fetch the staff name
        },
      ],
    });

    // ✅ Map leads to include staffName directly for clarity
    const leadsWithStaff = rows.map((lead) => ({
      ...lead.toJSON(),
      staffName: lead.staff ? lead.staff.name : null,
    }));

    return httpSuccess(res, 200, "Client Leads fetched successfully", {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      leads: leadsWithStaff,
    });
  } catch (error) {
    console.error("Error in getting Leads", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

module.exports = { getCompletedLeads, getGlobalCompletedLeads };
