const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const messages = require("../../models/v1/Work_space/message");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op, Sequelize } = require("sequelize");

const createMessages = async (data) => {
  try {
    const { senderId, receiverId, message } = data;

        console.log('data',data)


    if (!senderId || !receiverId || !message) {
      throw new Error("Missing required fields");
    }

    const { text, time, date } = message;

    // Convert date to YYYY-MM-DD (if provided in DD-MM-YYYY)
    const sendingDate = date.includes("-")
      ? date.split("-").reverse().join("-") // ["17","10","2025"] -> "2025-10-17"
      : date;

    // Ensure sendingTime is in HH:MM:SS 24-hour format for DB storage
    let sendingTime = time;

    // If time is in 12-hour format with AM/PM, convert to 24-hour HH:MM:SS
    const ampmMatch = sendingTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (ampmMatch) {
      let [_, hr, min, ampm] = ampmMatch;
      hr = parseInt(hr, 10);
      if (ampm.toUpperCase() === "PM" && hr !== 12) hr += 12;
      if (ampm.toUpperCase() === "AM" && hr === 12) hr = 0;
      sendingTime = `${hr.toString().padStart(2, "0")}:${min}:00`;
    } else if (/^\d{2}:\d{2}$/.test(sendingTime)) {
      sendingTime = sendingTime + ":00"; // HH:MM → HH:MM:SS
    }

    // Check admin role
    const isAdmin = await roleChecker(senderId);

    // Save message in database
    const newMessage = await messages.create({
      message: text,
      sendingDate,
      sendingTime,
      receiverId,
      senderId,
      isAdmin,
    });

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
