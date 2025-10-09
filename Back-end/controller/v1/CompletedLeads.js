
const  leads = require("../../models/v1/Customer/leads");
const {httpError, httpSuccess} = require("../../utils/v1/httpResponse");
const { Op } = require("sequelize");


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


module.exports = {getCompletedLeads};