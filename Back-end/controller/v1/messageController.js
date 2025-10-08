const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const messages = require("../../models/v1/Work_space/message");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const { Op, Sequelize } = require("sequelize");

const createMessages = async (data) => {
  try {
    const { senderId, receiverId, message } = data;

    console.log("Received data:", data);
    if (!senderId || !receiverId || !message) {
      throw new Error("Missing required fields");
    }

    const { text, time, date } = message;
    const parts = date.split("-"); // ["08", "10", "2025"]
    const rotated = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const admin = await roleChecker(senderId);

    const newMessage = await messages.create({
      message: text,
      sendingTime: time,
      sendingDate: rotated,
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
        [
          Sequelize.literal(
            "STR_TO_DATE(CONCAT(sendingDate, ' ', sendingTime), '%Y-%m-%d %h:%i %p')"
          ),
          "ASC",
        ],
      ],
    });

    const userId = user.id;

    return httpSuccess(res, 200, "Messages fetched successfully", {
      existing,
      userId,
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
