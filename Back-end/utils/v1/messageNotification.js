
const messageNotification = async(io, id, name)=>{
    try {
      io.to(`notify_${id}`).emit("receive_notification", {
        title: "Message Notification",
        message: `You got a new message from: ${name}`,
        type: "Message",
        timestamp: new Date(),
      });


    } catch (error) {
        console.log('error in messageNotification',error)
    }
}


module.exports = {messageNotification}