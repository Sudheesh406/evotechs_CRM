const Leads = require("../../models/v1/Customer/leads");
const Contacts = require("../../models/v1/Customer/contacts")
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const { Op } = require("sequelize");


//leads
const createLeads = async (req, res) => {
  try {
    const user = req.user; 

    const { name, description, email, phone, source, priority, amount } = req.body;

    // Validate required fields
    if (!name || !description || !email || !phone || !source || !priority || !amount) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
    const existingLead = await Leads.findOne({ where: { phone } });
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
      amount,
      staffId: user?.id,
    });

    return httpSuccess(res, 201, "Lead created successfully", result);
  } catch (err) {
    console.error("Error in createLeads:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};


const getLeads = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic where condition
    const whereCondition = {
      staffId: user.id,
      softDelete: false, // ✅ only fetch non-deleted leads
    };

    if (search.trim()) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Leads.findAndCountAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return httpSuccess(res, 200, "Leads fetched successfully", {
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


const updateLeads = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const data = req.body;

    const customer = await Leads.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Lead not found");
    }

    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    const updated = await customer.update(data);

    return httpSuccess(res, 200, "Lead updated successfully", updated);
  } catch (error) {
    console.error("Error in updating Leads:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const deleteLeads = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Find the lead
    const customer = await Leads.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Lead not found");
    }

    // Ownership check
    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    // Perform soft delete
    const updated = await customer.update({ softDelete: true });

    return httpSuccess(res, 200, "Lead soft deleted successfully", updated);
  } catch (error) {
    console.error("Error in soft deleting Leads:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const approveLeads = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const customer = await Leads.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Lead not found");
    }

    // Ownership check
    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    // Copy data into Contacts (plain object)
    const approved = await Contacts.create(customer.toJSON());

    // Delete from Leads
    await Leads.destroy({ where: { id } });

    return httpSuccess(res, 200, "Lead approved successfully", approved);
  } catch (error) {
    console.error("Error in approve Leads:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};

//contacts
const createContact = async (req, res) => {
  try {
    const user = req.user; 

    const { name, description, email, phone, source, priority, amount } = req.body;

    // Validate required fields
    if (!name || !description || !email || !phone || !source || !priority || !amount) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
    const existingLead = await Contacts.findOne({ where: { email } });
    if (existingLead) {
      return httpError(res, 409, "A Contacts with this email already exists");
    }

    // Create the Contact
    const result = await Contacts.create({
      name,
      description,
      email,
      phone,
      source,
      priority,
      amount,
      staffId: user?.id,
    });

    return httpSuccess(res, 201, "Contact created successfully", result);
  } catch (err) {
    console.error("Error in createContacts:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};


const getContact = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic where condition
    const whereCondition = {
      staffId: user.id,
      softDelete: false, // ✅ only fetch non-deleted leads
    };

    if (search.trim()) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Contacts.findAndCountAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return httpSuccess(res, 200, "Contact fetched successfully", {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      leads: rows,
    });
  } catch (error) {
    console.error("Error in getting Contact", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const updateContact = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const data = req.body;

    const customer = await Contacts.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Contact not found");
    }

    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    const updated = await customer.update(data);

    return httpSuccess(res, 200, "Contact updated successfully", updated);
  } catch (error) {
    console.error("Error in updating Contact:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const deleteContact = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Find the Contacts
    const customer = await Contacts.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Contact not found");
    }

    // Ownership check
    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    // Perform soft delete
    const updated = await customer.update({ softDelete: true });

    return httpSuccess(res, 200, "Contact soft deleted successfully", updated);
  } catch (error) {
    console.error("Error in soft deleting Contact:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


module.exports = { createLeads, getLeads, updateLeads, deleteLeads, approveLeads,
  deleteContact, updateContact, getContact, createContact
 };
