 const {httpSuccess, httpError} = require('../../utils/v1/httpResponse')
 const messages = require("../../models/v1/Work_space/message")
 const signup = require('../../models/v1/Authentication/authModel')
 const roleChecker = require('../../utils/v1/roleChecker')

const createMessages = async (req, res) => {
  try {
    const user = req.user;
    const { message, receiverId, term } = req.body;

    // Validate required fields
    if (!message || !receiverId || !term) {
      return res.status(400).json({
        success: false,
        message: 'message, receiverId, and term are required',
      });
    }

    // Determine whether it's a team message or individual
    let teamId = null;
    let individualId = null;
    if (term === 'team') {
      teamId = receiverId;
    } else {
      individualId = receiverId;
    }

    // Check if user is admin
    const isAdmin = await roleChecker(user.id);

    // Create message in DB
    const createdMessage = await messages.create({
      message,
      receiverId: individualId,
      senderId: user.id,
      teamId: teamId,
      isAdmin: isAdmin,
      // sendingTime and sendingDate can rely on default CURRENT_TIMESTAMP
    });

    return res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: createdMessage,
    });
  } catch (error) {
    console.error('Error in createMessages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = { createMessages };