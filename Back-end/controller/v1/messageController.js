const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const messages = require("../../models/v1/Work_space/message");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op } = require("sequelize");

function convertToMySQLTime(time12h) {
  if (!time12h) return null;

  let hours, minutes;

  if (time12h.includes("AM") || time12h.includes("PM")) {
    // 12-hour format
    const [timePart, modifier] = time12h.split(" ");
    [hours, minutes] = timePart.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
  } else {
    // 24-hour format, e.g., "10:29:00"
    [hours, minutes] = time12h.split(":").map(Number);
  }

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}


const createMessages = async (data) => {
  try {
    const { senderId, receiverId, message } = data;
    const { text, time } = message;

    const mysqlDateTime = convertToMySQLTime(time);
    if (!mysqlDateTime) throw new Error("Invalid time format");

    const [datePart, timePart] = mysqlDateTime.split(" ");
    const admin = await roleChecker(senderId);

    const newMessage = await messages.create({
      message: text,
      sendingTime: timePart,
      sendingDate: datePart,
      receiverId,
      senderId,
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

    const existing = await messages.findAll({
      where: {
        [Op.or]: [
          { senderId: user.id, receiverId: id },
          { senderId: id, receiverId: user.id },
        ],
      },
      order: [
        ["sendingDate", "ASC"],  // first sort by date
        ["sendingTime", "ASC"],  // then by time
      ],
    });  


    const userId = user.id;

    return httpSuccess(res, 201, "Messages fetched successfully", { existing, userId });
  } catch (error) {
    console.log("Error found in getting messages", error);
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
