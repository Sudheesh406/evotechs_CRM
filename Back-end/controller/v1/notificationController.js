const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const signup = require("../../models/v1/Authentication/authModel");
const roleChecker = require("../../utils/v1/roleChecker");
const notification = require("../../models/v1/Work_space/notification");


const createNotification = async(data)=>{
    try {
        const result = await notification.create(data)
     
    } catch (error) {
        console.log('error found in create Notification',error)
    }
}


const clearNotification = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    if (id) {
      // Delete a specific notification
      const deleted = await notification.destroy({
        where: { id, receiverId: user.id },
      });

      if (deleted) {
        return res.status(200).json({ message: "Notification cleared successfully." });
      } else {
        return res.status(404).json({ message: "Notification not found." });
      }
    } else {
      // Clear all notifications for this user
      await notification.destroy({
        where: { receiverId: user.id },
      });

      return res.status(200).json({ message: "All notifications cleared successfully." });
    }
  } catch (error) {
    console.error("Error in clearNotification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {createNotification, clearNotification}