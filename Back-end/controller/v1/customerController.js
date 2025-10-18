const Contacts = require("../../models/v1/Customer/contacts");
const leads = require("../../models/v1/Customer/leads");
const trash = require("../../models/v1/Trash/trash");
const task = require('../../models/v1/Project/task')
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const { Op } = require("sequelize");

//leads
const createLeads = async (req, res) => {
  try {
    const user = req.user;
    const { name, description, location, phone, source, priority, amount, email } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !phone ||
      !source ||
      !location ||
      !amount
    ) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
    const existingLead = await leads.findOne({ where: { phone } });
    if (existingLead) {
      return httpError(res, 409, "A lead with this email already exists");
    }
    const Priority = null
    // Create the lead
    const result = await leads.create({
      name,
      description,
      email,
      phone,
      location,
      source,
      Priority ,
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

    const { count, rows } = await leads.findAndCountAll({
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

    const customer = await leads.findOne({ where: { id } });
    if (!customer) return httpError(res, 404, "Lead not found");

    if (customer.staffId !== user.id)
      return httpError(res, 403, "Access denied");

    // Check duplicates separately
    const existEmail = await leads.findOne({
      where: { email: data.email, id: { [Op.ne]: id } },
    });

    if (existEmail){
      return httpError(res, 409, "Another lead already exists with this email");
    }

    const existPhone = await leads.findOne({
      where: { phone: data.phone, id: { [Op.ne]: id } },
    });

    const contactDetails = await Contacts.findAll({where:{phone : data.phone, staffId: user.id}})
    let client = data.priority;
    
    if(!contactDetails || contactDetails.length == 0){
     if(client === 'Client'){
       Contacts.create({
         staffId : user.id,
         amount : data.amount,
         location : data.location,
         source : data.source,
         phone : data.phone,
         email : data.email,
         description : data.description,
         name : data.name,
       })
     }
    }

    if (existPhone)
      return httpError(
        res,
        409,
        "Another lead already exists with this phone number"
      );

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
    const customer = await leads.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Lead not found");
    }

    // Ownership check
    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    

    const moment = require("moment-timezone");

    // Get current Indian Railway time (IST)
    const now = moment().tz("Asia/Kolkata");

    const currentDate = now.format("YYYY-MM-DD"); // only date
    const currentTime = now.format("HH:mm:ss");

    await trash.create({
      data: "leads",
      dataId: id,
      staffId: user.id, // can be null if no staff
      date: currentDate,
      time: currentTime,
      // dateTime will automatically use default: DataTypes.NOW
    });

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

    // 1️⃣ Fetch the lead
    const customer = await leads.findOne({ where: { id } });
    if (!customer) {
      return httpError(res, 404, "Lead not found");
    }

    // 2️⃣ Ownership check
    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    // 3️⃣ Check for existing contact by email
    const existingContact = await Contacts.findOne({
      where: { email: customer.email, phone: customer.phone },
    });
    if (existingContact) {
      return httpError(res, 400, "A contact with this email already exists");
    }

    // 4️⃣ Prepare the contact payload
    const contact = {
      name: customer.name,
      description: customer.description,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
      source: customer.source,
      priority: customer.priority,
      amount: customer.amount,
      verified: customer.verified,
      softDelete: customer.softDelete,
      staffId: customer.staffId,
    };

    // 5️⃣ Create the contact
    const approved = await Contacts.create(contact);

    return httpSuccess(res, 200, "Lead approved successfully", approved);
  } catch (error) {
    console.error("Error in approve Leads:", error);

    // 6️⃣ Handle Sequelize unique constraint just in case
    if (error.name === "SequelizeUniqueConstraintError") {
      return httpError(res, 400, "A contact with this email already exists");
    }

    return httpError(res, 500, "Internal Server Error");
  }
};


//contacts
const createContact = async (req, res) => {
  try {
    const user = req.user;

    const { name, description, email, phone, source, priority, amount } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !email ||
      !phone ||
      !source ||
      !priority ||
      !amount
    ) {
      return httpError(res, 400, "All fields are required");
    }

    // Optionally: check if email or phone already exists
    const existingLead = await Contacts.findOne({ where: { email, phone } });
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
    if (!customer) return httpError(res, 404, "contact not found");

    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    // Check duplicates separately
    const existEmail = await Contacts.findOne({
      where: { email: data.email, id: { [Op.ne]: id } },
    });

    if (existEmail)
      return httpError(
        res,
        409,
        "Another contact already exists with this email"
      );

    const existPhone = await Contacts.findOne({
      where: { phone: data.phone, id: { [Op.ne]: id } },
    });

    if (existPhone)
      return httpError(
        res,
        409,
        "Another contact already exists with this phone number"
      );

    const updated = await customer.update(data);
    return httpSuccess(res, 200, "contact updated successfully", updated);
  } catch (error) {
    console.error("Error in updating Contact:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const deleteContact = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Find the contact
    const customer = await Contacts.findOne({ where: { id } });

    if (!customer) {
      return httpError(res, 404, "Contact not found");
    }

    // Ownership check
    if (customer.staffId !== user.id) {
      return httpError(res, 403, "Access denied");
    }

    // Check if any task is linked with this contact's phone
    const taskDetails = await task.findOne({ where: { phone: customer.phone } });
    if (taskDetails) {
      return httpError(res, 406, "A Task is associated with this contact");
    }

    const moment = require("moment-timezone");
    const now = moment().tz("Asia/Kolkata");
    const currentDate = now.format("YYYY-MM-DD");
    const currentTime = now.format("HH:mm:ss");

    // Add to trash log
    await trash.create({
      data: "contacts",
      dataId: id,
      staffId: user.id,
      date: currentDate,
      time: currentTime,
    });

    // Soft delete
    const updated = await customer.update({ softDelete: true });

    return httpSuccess(res, 200, "Contact soft deleted successfully", updated);
  } catch (error) {
    console.error("Error in soft deleting Contact:", error);
    return httpError(res, 500, "Internal Server Error");
  }
};


const getPendingLeads = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic where condition
    const whereCondition = {
      staffId: user.id,
      softDelete: false,
      priority: {
        [Op.in]: ["NoUpdates", "WaitingPeriod"],
      },
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


const getRejectLeads = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic where condition
    const whereCondition = {
      staffId: user.id,
      softDelete: false,
      priority: 'NotAnClient',
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


module.exports = {
  createLeads,
  getLeads,
  updateLeads,
  deleteLeads,
  approveLeads,
  deleteContact,
  updateContact,
  getContact,
  createContact,
  getPendingLeads,
  getRejectLeads
};
