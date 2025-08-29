
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
    const {
      name,
      subject,
      date,
      time,
      phoneNumber,
      contactId,
      description,
    } = req.body.data;

    console.log(
      "data:",
      name,
      subject,
      date,
      time,
      phoneNumber,
      contactId,
      description,
    );

    // Validate required fields
    if (
      !name ||
      !subject ||
      !date ||
      !time ||
      !phoneNumber ||
      !description
    ) {
      return httpError(res, 400, "All fields are required");
    }

    // ✅ Convert times to MySQL TIME format (HH:mm:ss)
    const formattedTime = dayjs(time, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );

    // Prevent invalid time values (e.g., if someone types letters)
    if (
      formattedTime === "Invalid Date" 
    ) {
      return httpError(res, 400, "Invalid time format. Please use hh:mm AM/PM");
    }

    const staffId = user.id;
    let customer = null;

    // Case 1: ContactId is provided
    if (contactId) {
      customer = await Contacts.findOne({ where: { id: contactId, staffId } });
      if (!customer) {
        return httpError(res, 404, "Contact not found for this staff");
      }
    }
    // Case 2: No contactId → try by phone number
    else if (phoneNumber) {
      customer = await Contacts.findOne({
        where: { phone: phoneNumber, staffId },
      });
      // If not found → will just create without linking
    }

    // Create meetings (with or without customer link)
    const result = await meetings.create({
      name,
      subject,
      date,
      time: formattedTime, // ✅ Save in proper format
      phoneNumber,
      description,
      staffId,
      contactId: customer ? customer.id : null,
    });

    return httpSuccess(res, 201, "meetings created successfully", result);
  } catch (error) {
    console.error("Error in createMeetings:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};


const deleteCalls = 


module.exports = { createCalls};
