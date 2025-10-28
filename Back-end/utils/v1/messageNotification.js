
const {
  createNotification,
} = require("../../controller/v1/notificationController");

const messageNotification = async(io, id, name)=>{
    try {
      io.to(`notify_${id}`).emit("receive_notification", {
        title: "Message Notification",
        message: `You got a new message from: ${name}`,
        type: "Message",
        timestamp: new Date(),
      });

       const value = {};
    value.title = "Message Notification";
    value.description = "You got a new message";
    value.receiverId = id;
    createNotification(value);

    } catch (error) {
        console.log('error in messageNotification',error)
    }
}


module.exports = {messageNotification}