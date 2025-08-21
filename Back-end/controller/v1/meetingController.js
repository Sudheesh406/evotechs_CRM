const meeting = require("../../models/v1/Customer/meetings");
const Contacts = require("../../models/v1/Customer/contacts");
const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");

const createMeetings = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      subject,
      meetingDate,
      startTime,
      endTime,
      phoneNumber,
      amount,
      contactId,
      description,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !subject ||
      !meetingDate ||
      !startTime ||
      !endTime ||
      !phoneNumber ||
      !amount ||
      !description
    ) {
      return httpError(res, 400, "All fields are required");
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
      customer = await Contacts.findOne({ where: { phone: phoneNumber, staffId } });
      // If not found → will just create without linking
    }

    // Create meeting (with or without customer link)
    const result = await meeting.create({
      name,
      subject,
      meetingDate,
      startTime,
      endTime,
      phoneNumber,
      amount,
      description,
      staffId,
      contactId: customer ? customer.id : null,
    });

    return httpSuccess(res, 201, "Meeting created successfully", result);
  } catch (error) {
    console.error("Error in createMeetings:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

module.exports = { createMeetings };
