const meetings = require("../../models/v1/Customer/meetings");
const Contacts = require("../../models/v1/Customer/contacts");
const {signup} = require("../../models/v1/index")
const { httpError, httpSuccess } = require("../../utils/v1/httpResponse");
const dayjs = require("dayjs");          // ✅ Import dayjs
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
    const formattedStartTime = dayjs(startTime, ["h:mm A", "HH:mm"]).format("HH:mm:ss");
    const formattedEndTime = dayjs(endTime, ["h:mm A", "HH:mm"]).format("HH:mm:ss");

    // Prevent invalid time values (e.g., if someone types letters)
    if (formattedStartTime === "Invalid Date" || formattedEndTime === "Invalid Date") {
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
      customer = await Contacts.findOne({ where: { phone: phoneNumber, staffId } });
      // If not found → will just create without linking
    }

    // Create meetings (with or without customer link)
    const result = await meetings.create({
      name,
      subject,
      meetingDate,
      startTime: formattedStartTime,   // ✅ Save in proper format
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

    console.log(filter)

    let where = {
      staffId: user.id,
    };

  switch (filter) {
  case "Today's":
    where.meetingDate = today;
    break;

  case "Upcoming":
    where.meetingDate = { [Op.gt]: today };
    where.status = "Upcoming";  // only upcoming ones
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
      ],
      order: [["meetingDate", "ASC"]],
    });

    return httpSuccess(res, 200, "meetings created successfully", result);

  } catch (error) {
    console.error("Error fetching meetings:", error);
    return httpError(res, 500, "Server error", error.message);

  }
};


//editing is pending in here-------------------------------------

const editMeetings = async(req,res)=>{
  const user = req.user
  const newData = req.body
  const id = req.params.id

  console.log('datas:',user,newData,id)
  try {

  } catch (error) {
    console.log('error found in edit meetings',error)
    return httpError(res, 500, "Server error", error.message);

  }
}



module.exports = { createMeetings, getMeetings, editMeetings };
