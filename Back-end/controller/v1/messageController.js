const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const messages = require("../../models/v1/Work_space/message");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op, Sequelize } = require("sequelize");
const {messageNotification} = require('../../utils/v1/messageNotification')

const createMessages = async (data) => {
  try {
    const { senderId, receiverId, message } = data;
    console.log("data", data);

    if (!senderId || !receiverId || !message) {
      throw new Error("Missing required fields");
    }

    // Use correct message keys
    const { text, sendingDate: date, sendingTime: time } = message;

    // ✅ Only convert if DD-MM-YYYY, otherwise keep as-is
    let sendingDate = date;
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split("-");
      sendingDate = `${year}-${month}-${day}`;
    }

    // ✅ Ensure HH:MM:SS
    let sendingTime = time;
    if (/^\d{2}:\d{2}$/.test(sendingTime)) {
      sendingTime = `${sendingTime}:00`;
    }

    const isAdmin = await roleChecker(senderId);

    const senderDetails = await signup.findOne({where:{id:senderId}})

    const newMessage = await messages.create({
      message: text,
      sendingDate,
      sendingTime,
      receiverId,
      senderId,
      isAdmin,
    });
    

    messageNotification(receiverId,senderDetails.name)

    console.log("✅ Message created successfully:", newMessage.dataValues);
    return newMessage;
  } catch (error) {
    console.error("❌ Error in createMessages:", error);
    throw error;
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
        [
          Sequelize.literal("CONCAT(sendingDate, ' ', sendingTime)"),
          "ASC",
        ],
        ["id", "ASC"], // secondary sort for stability
      ],
    });

    return httpSuccess(res, 200, "Messages fetched successfully", {
      existing,
      userId: user.id,
    });
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
