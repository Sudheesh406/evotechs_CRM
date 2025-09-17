const meetings = require("../../models/v1/Customer/meetings");
const Contacts = require("../../models/v1/Customer/contacts");
const { signup } = require("../../models/v1/index");
const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const dayjs = require("dayjs"); // ✅ Import dayjs
const customParseFormat = require("dayjs/plugin/customParseFormat");
const { Op } = require("sequelize");
const moment = require("moment");
dayjs.extend(customParseFormat);

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
      contactId,
      description,
    } = req.body.data;

    console.log(
      "data:",
      name,
      subject,
      meetingDate,
      startTime,
      endTime,
      phoneNumber,
      description
    );

    // Validate required fields
    if (
      !name ||
      !subject ||
      !meetingDate ||
      !startTime ||
      !endTime ||
      !phoneNumber ||
      !description
    ) {
      return httpError(res, 400, "All fields are required");
    }

    // ✅ Convert times to MySQL TIME format (HH:mm:ss)
    const formattedStartTime = dayjs(startTime, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );
    const formattedEndTime = dayjs(endTime, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );

    // Prevent invalid time values (e.g., if someone types letters)
    if (
      formattedStartTime === "Invalid Date" ||
      formattedEndTime === "Invalid Date"
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
      meetingDate,
      startTime: formattedStartTime, // ✅ Save in proper format
      endTime: formattedEndTime,
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

const getMeetings = async (req, res) => {
  const user = req.user;

  try {
    const { filter } = req.body;
    const today = moment().format("YYYY-MM-DD");

    // console.log(filter)

    let where = {
      [Op.or]: [{ staffId: user.id }, { TeamStaffId: user.id }],
      softDelete: false,
    };

    switch (filter) {
      case "Today's":
        where.meetingDate = today;
        break;

      case "Upcoming":
        where.meetingDate = { [Op.gt]: today };
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

        where.meetingDate = {
          [Op.between]: [startOfWeek, endOfWeek],
        };
        break;

      case "All":
      default:
        break;
    }
    const result = await meetings.findAll({
      where,
      include: [
        {
          model: signup,
          as: "staff",
          attributes: ["id", "name"],
        },
        {
          model: signup,
          as: "teamStaff",
          attributes: ["id", "name"],
        },
      ],
      order: [["meetingDate", "ASC"]],
    });

    return httpSuccess(res, 200, "meetings getted successfully", result);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

const editMeetings = async (req, res) => {
  const user = req.user;
  const newData = req.body.data;
  const id = req.params.id;

  try {
    if (!id) return httpError(res, 400, "Meeting ID is required");
    if (!newData || Object.keys(newData).length === 0) {
      return httpError(res, 400, "No update data provided");
    }

    const meeting = await meetings.findByPk(id);
    if (!meeting) return httpError(res, 404, "Meeting not found");
    
    const isMainStaff = meeting.staffId === user.id;
    const isTeamStaff = meeting.TeamStaffId === user.id;

    if (!isMainStaff && !isTeamStaff) {
      return httpError(res, 403, "Access denied");
    }

    // ✅ Validation for required fields
    const requiredFields = [
      "name",
      "subject",
      "meetingDate",
      "startTime",
      "endTime",
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
    if (newData.startTime) {
      const formattedStartTime = dayjs(newData.startTime, [
        "h:mm A",
        "HH:mm",
      ]).isValid()
        ? dayjs(newData.startTime, ["h:mm A", "HH:mm"]).format("HH:mm:ss")
        : null;

      if (!formattedStartTime) {
        return httpError(
          res,
          400,
          "Invalid start time format. Please use hh:mm AM/PM"
        );
      }
      newData.startTime = formattedStartTime;
    }

    if (newData.endTime) {
      const formattedEndTime = dayjs(newData.endTime, [
        "h:mm A",
        "HH:mm",
      ]).isValid()
        ? dayjs(newData.endTime, ["h:mm A", "HH:mm"]).format("HH:mm:ss")
        : null;

      if (!formattedEndTime) {
        return httpError(
          res,
          400,
          "Invalid end time format. Please use hh:mm AM/PM"
        );
      }
      newData.endTime = formattedEndTime;
    }

    // ✅ Update contactId if phone number changed
    if (newData.phoneNumber) {
      const contact = await Contacts.findOne({
        where: {
          phone: newData.phoneNumber,
          [Op.or]: [{ staffId: user.id }, { TeamStaffId: user.id }],
        },
      });
      newData.contactId = contact ? contact.id : null;
    }

    await meeting.update(newData);
    return httpSuccess(res, 200, "Meeting updated successfully", meeting);
  } catch (error) {
    console.error("error found in edit meetings", error);
    return httpError(res, 500, "Server error", error.message);
  }
};


const deleteMeetings = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;

    if (!id) {
      return httpError(res, 400, "Meeting ID is required");
    }

    // Find meeting by primary key
    const meeting = await meetings.findByPk(id);

    if (!meeting) {
      return httpError(res, 404, "Meeting not found");
    }

    const isMainStaff = meeting.staffId === user.id;
    const isTeamStaff = meeting.TeamStaffId === user.id;

    if (!isMainStaff && !isTeamStaff) {
      return httpError(res, 403, "Access denied");
    }

    // Instead of destroying, update softDelete
    await meeting.update({ softDelete: true || null });

    return res.status(200).json({
      success: true,
      message: "Meeting deleted successfully (soft delete applied)",
    });
  } catch (error) {
    console.error("error found in delete meetings", error);
    return httpError(res, 500, "Server error", error.message);
  }
};


const createMeetingFromTask = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      subject,
      date,
      startTime,
      endTime,
      phoneNumber,
      contactId,
      description,
    } = req.body.data;

    // Validate required fields
    if (
      !name ||
      !subject ||
      !date ||
      !startTime ||
      !endTime ||
      !phoneNumber ||
      !description ||
      !contactId
    ) {
      return httpError(res, 400, "All fields are required");
    }

    // ✅ Convert times to MySQL TIME format (HH:mm:ss)
    const formattedStartTime = dayjs(startTime, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );
    const formattedEndTime = dayjs(endTime, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );

    // Prevent invalid time values (e.g., if someone types letters)
    if (
      formattedStartTime === "Invalid Date" ||
      formattedEndTime === "Invalid Date"
    ) {
      return httpError(res, 400, "Invalid time format. Please use hh:mm AM/PM");
    }

    const staffId = user.id;

    const result = await meetings.create({
      name,
      subject,
      meetingDate: date,
      startTime: formattedStartTime, // ✅ Save in proper format
      endTime: formattedEndTime,
      phoneNumber,
      description,
      staffId,
      contactId,
    });

    return httpSuccess(res, 201, "meetings created successfully", result);
  } catch (error) {
    console.error("Error in createMeetings:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};


const createTeamMeetingFromTask = async (req, res) => {
  try {

    const user = req.user;
    const {
      name,
      subject,
      date,
      startTime,
      endTime,
      phoneNumber,
      contactId,
      staffId,
      description,
    } = req.body.data;

    // Validate required fields
    if (
      !name ||
      !subject ||
      !date ||
      !startTime ||
      !endTime ||
      !phoneNumber ||
      !description ||
      !contactId ||
      !staffId
    ) {
      return httpError(res, 400, "All fields are required");
    }


    // ✅ Convert times to MySQL TIME format (HH:mm:ss)
    const formattedStartTime = dayjs(startTime, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );
    const formattedEndTime = dayjs(endTime, ["h:mm A", "HH:mm"]).format(
      "HH:mm:ss"
    );

    // Prevent invalid time values (e.g., if someone types letters)
    if (
      formattedStartTime === "Invalid Date" ||
      formattedEndTime === "Invalid Date"
    ) {
      return httpError(res, 400, "Invalid time format. Please use hh:mm AM/PM");
    }

  let TeamStaffId = null;
    if (staffId != user.id) {
      TeamStaffId = user.id;
    }

     const result = await meetings.create({
      name,
      subject,
      meetingDate: date,
      startTime: formattedStartTime, // ✅ Save in proper format
      endTime: formattedEndTime,
      phoneNumber,
      description,
      staffId,
      contactId,
      TeamStaffId
    });
    return httpSuccess(res, 201, "meetings created successfully", result);

  } catch (error) {
    console.error("Error in createTeamMeetingFromTask:", error);
    return httpError(res, 500, "Server error", error.message);
  }
};

module.exports = {
  createMeetings,
  getMeetings,
  editMeetings,
  deleteMeetings,
  createMeetingFromTask,
  createTeamMeetingFromTask,
};
