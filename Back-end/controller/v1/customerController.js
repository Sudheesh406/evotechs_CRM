const Leads = require("../../models/v1/Customer/Leads");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");

const createLeads = async (req, res) => {
  try {
    const user = req.user; // optional: can use user info for logging/ownership

    const { name, description, email, phone, source, priority } = req.body;

    // Validate required fields
    if (!name || !description || !email || !phone || !source || !priority) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
    const existingLead = await Leads.findOne({ where: { email } });
    if (existingLead) {
      return httpError(res, 409, "A lead with this email already exists");
    }

    // Create the lead
    const result = await Leads.create({
      name,
      description,
      email,
      phone,
      source,
      priority,
      staffId: user?.id  // optional: track who created the lead
    });

    return httpSuccess(res, 201, "Lead created successfully", result);
  } catch (err) {
    console.error("Error in createLeads:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};



module.exports = { createLeads };
