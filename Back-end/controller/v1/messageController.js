const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const messages = require("../../models/v1/Work_space/message");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
    const { Op } = require("sequelize");


function convertToMySQLTime(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const now = new Date();
  now.setHours(hours, parseInt(minutes), 0, 0); // set hours, minutes, seconds, ms

  // MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
  return now.toISOString().slice(0, 19).replace("T", " ");
}

const createMessages = async (data) => {
  try {
    const { senderId, staffId, message } = data;
    const { text, time } = message;

    const mysqlDateTime = convertToMySQLTime(time);
    const admin = await roleChecker(senderId);

    const newMessage = await messages.create({
      message: text,
      sendingTime: mysqlDateTime, // DATETIME
      sendingDate: mysqlDateTime.split(" ")[0], // DATE
      receiverId: staffId,
      senderId: senderId,
      isAdmin: admin,
    });
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
        senderId: user.id,
        receiverId: id,
      },
      order: [["sendingTime", "ASC"]],
    });

    return httpSuccess(res, 201, "message fetched successfully", existing);
  } catch (error) {
    console.log("error found in getting messages", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};


const getAllMembers = async (req, res) => {
  console.log('nndndnd')
  try {
    const excludedId = req.user.id
    console.log('bdb')

    const existing = await signup.findAll({
      attributes: ["id", "name", "email"],
      where: {
        id: {
          [Op.ne]: excludedId,
        },
      },
    });

    console.log(existing)

    // return httpSuccess(res, 201, "message fetched successfully", existing);
  } catch (error) {
    console.log("error found in getting all members", error);
    return httpError(res, 500, "Server error", error.message || error);
  }
};

///////////////////////////the message time has a problem//////////////////////////////////

module.exports = { createMessages, getMessages, getAllMembers };
