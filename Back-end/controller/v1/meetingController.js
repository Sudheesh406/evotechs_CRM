const meeting = require('../../models/v1/Customer/meetings')
const { httpError, httpSuccess } = require('../../utils/v1/httpResponse')
const Contacts = require("../../models/v1/Customer/contacts")

const createMeetings = async (req,res)=>{
    try {

    const user = req.user
    const { name, subject, staffId, contactId, meetingDate, startTime, endTime, phoneNumber, amount, description  } = req.body;

    // Validate required fields
    if ( !name || !subject || !staffId || !contactId || !meetingDate || !startTime || !endTime || !phoneNumber || !amount || !description ) {
      return httpError(res, 400, "All fields are required");
    }
        
    } catch (error) {
    console.error("Error in create meetings:", err);
    return httpError(res, 500, "Server error", err.message);
    }

}