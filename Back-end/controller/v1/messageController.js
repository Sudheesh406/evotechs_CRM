const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const messages = require("../../models/v1/Work_space/message");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op } = require("sequelize");

function convertToMySQLTime(time12h) {
  // e.g. time12h = "09:58 AM"
  const [timePart, modifier] = time12h.split(" ");
  let [hours, minutes] = timePart.split(":");

  hours = parseInt(hours, 10);
  if (modifier.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);

  // Format to MySQL DATETIME
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

const createMessages = async (data) => {
  console.log('data',data)
  try {
    const { senderId, receiverId, message } = data;
    const { text, time } = message; // time can be like "2025-09-29 10:29:00" or "10:29 AM"

    // Convert to MySQL DATETIME format if needed
    const mysqlDateTime = convertToMySQLTime(time); // "2025-09-29 10:29:00"

    // Extract date and time separately
    const [datePart, timePart] = mysqlDateTime.split(" "); // datePart="2025-09-29", timePart="10:29:00"

    const admin = await roleChecker(senderId);

    const newMessage = await messages.create({
      message: text,
      sendingTime: timePart,
      sendingDate: datePart,
      receiverId: receiverId,
      senderId: senderId,
      isAdmin: admin,
    });

    console.log("Message created successfully:", newMessage);
  } catch (error) {
    console.error("Error in createMessages:", error);
  }
};

const getMessages = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    console.log("id", id);

    const existing = await messages.findAll({
      where: {
        [Op.or]: [
          { senderId: user.id, receiverId: id },
          { senderId: id, receiverId: user.id },
        ],
      },
      order: [["sendingTime", "ASC"]],
    });

    console.log(existing);

    return httpSuccess(res, 201, "message fetched successfully", existing);
  } catch (error) {
    console.log("error found in getting messages", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const getAllMembers = async (req, res) => {
  try {
    const excludedId = req.user.id;

    const existing = await signup.findAll({
      attributes: ["id", "name", "email", "role"],
      where: {
        id: {
          [Op.ne]: excludedId,
        },
      },
    });

    // console.log(existing);

    return httpSuccess(res, 201, "message fetched successfully", {
      existing,
      excludedId,
    });
  } catch (error) {
    console.log("error found in getting all members", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

module.exports = { createMessages, getMessages, getAllMembers };
