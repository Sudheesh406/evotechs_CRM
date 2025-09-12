const calls = require("../../models/v1/Customer/calls");
const Contacts = require("../../models/v1/Customer/contacts");
const { signup } = require("../../models/v1/index");
const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const dayjs = require("dayjs"); // ✅ Import dayjs
const customParseFormat = require("dayjs/plugin/customParseFormat");
const { Op } = require("sequelize");
const moment = require("moment");
dayjs.extend(customParseFormat);

const createCalls = async (req, res) => {
  try {
    const user = req.user;
    const { name, subject, date, time, phoneNumber, contactId, description } =
      req.body.data;

    console.log("data:", name, subject, date, time, phoneNumber, description);

    // Validate required fields
    if (!name || !subject || !date || !time || !phoneNumber || !description) {
      return httpError(res, 400, "All fields are required");
    }

    // ✅ Convert times to MySQL TIME format (HH:mm:ss)
    const formattedTime = dayjs(time, ["h:mm A", "HH:mm"]).format("HH:mm:ss");

    // // Prevent invalid time values (e.g., if someone types letters)
    if (formattedTime === "Invalid Date") {
      return httpError(res, 400, "Invalid time format. Please use hh:mm AM/PM");
    }

    const staffId = user.id;
    let customer = null;

    // // Case 1: ContactId is provided
    if (contactId) {
      customer = await Contacts.findOne({ where: { id: contactId, staffId } });
      if (!customer) {
        return httpError(res, 404, "Contact not found for this staff");
      }
    }

    // // Case 2: No contactId → try by phone number
    else if (phoneNumber) {
      customer = await Contacts.findOne({
        where: { phone: phoneNumber, staffId },
      });
      //   // If not found → will just create without linking
    }

    // // Create meetings (with or without customer link)
    const result = await calls.create({
      name,
      subject,
      date,
      time: formattedTime, // ✅ Save in proper format
      phoneNumber,
      description,
      staffId,
      contactId: customer ? customer.id : null,
    });

    return httpSuccess(res, 201, "call created successfully", result);
  } catch (error) {
    console.error("Error in createCalls:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

const getCalls = async (req, res) => {
  const user = req.user;

  try {
    const { filter } = req.body;
    const today = moment().format("YYYY-MM-DD");

    console.log(filter);

    let where = {
      staffId: user.id,
      softDelete: false,
    };

    switch (filter) {
      case "Today's":
        where.date = today;
        break;

      case "Upcoming":
        where.date = { [Op.gt]: today };
        break;

      case "Completed":
        where.status = "completed";
        break;

      case "Pending":
        where.status = "pending";
        break;

      case "Cancelled":
        where.status = "cancelled";
        break;
        
      case "This Week":
        const startOfWeek = moment().startOf("week").format("YYYY-MM-DD");
        const endOfWeek = moment().endOf("week").format("YYYY-MM-DD");

        where.date = {
          [Op.between]: [startOfWeek, endOfWeek],
        };
        break;

      case "All":
      default:
        break;
    }
    const result = await calls.findAll({
      where,
      include: [
        {
          model: signup,
          as: "staff",
          attributes: ["id", "name"],
        },
      ],
      order: [["date", "ASC"]],
    });

    return httpSuccess(res, 200, "calls getted successfully", result);
  } catch (error) {
    console.error("Error fetching calls:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

const editCalls = async (req, res) => {
  const user = req.user;
  const newData = req.body.data;
  const id = req.params.id;

  try {
    if (!id) return httpError(res, 400, "Call ID is required");
    if (!newData || Object.keys(newData).length === 0) {
      return httpError(res, 400, "No update data provided");
    }

    const call = await calls.findByPk(id);
    if (!call) return httpError(res, 404, "Call not found");
    if (call.staffId != user.id) return httpError(res, 403, "Access denied");

    // ✅ Validation for required fields
    const requiredFields = [
      "name",
      "subject",
      "date",
      "time",
      "phoneNumber",
      "description",
    ];
    for (const field of requiredFields) {
      if (
        newData[field] !== undefined &&
        newData[field].toString().trim() === ""
      ) {
        return httpError(res, 400, `${field} cannot be empty`);
      }
    }

    // ✅ Normalize time fields if provided
    if (newData.time) {
      const formattedTime = dayjs(newData.time, ["h:mm A", "HH:mm"]).isValid()
        ? dayjs(newData.time, ["h:mm A", "HH:mm"]).format("HH:mm:ss")
        : null;

      if (!formattedTime) {
        return httpError(
          res,
          400,
          "Invalid start time format. Please use hh:mm AM/PM"
        );
      }
      newData.time = formattedTime;
    }

    // ✅ Update contactId if phone number changed
    if (newData.phoneNumber) {
      const contact = await Contacts.findOne({
        where: { phone: newData.phoneNumber, staffId: user.id },
      });
      newData.contactId = contact ? contact.id : null;
    }

    await call.update(newData);
    return httpSuccess(res, 200, "Call updated successfully", call);
  } catch (error) {
    console.error("error found in edit calls", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

const deleteCalls = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    if (!id) {
      return httpError(res, 400, "call ID is required");
    }

    // Find call by primary key
    const call = await calls.findByPk(id);

    if (!call) {
      return httpError(res, 404, "call not found");
    }

    if (call.staffId != user.id) {
      return httpError(res, 403, "Access denied");
    }

    // Instead of destroying, update softDelete
    await call.update({ softDelete: true || null });

    return res.status(200).json({
      success: true,
      message: "call deleted successfully (soft delete applied)",
    });
  } catch (error) {
    console.error("error found in delete calls", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

module.exports = { createCalls, getCalls, editCalls, deleteCalls };
