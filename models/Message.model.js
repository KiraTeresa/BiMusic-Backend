const {Schema, model} = require('mongoose');

const messageSchema = new Schema(
    {
        author: {
                type: Schema.Types.ObjectId,
                ref: "User"
      },
        text: {
            type: String
      },
        sendTo: {
          type: [{
            type: Schema.Types.ObjectId,
            ref: "User"}]
      },
        readBy: {
          type: [{
            type: Schema.Types.ObjectId,
            ref: "User"}]
      },
        chatId: {
          type: Schema.Types.ObjectId,
          ref: "Chat"
      },
    },
    {
      timestamps: true,
    }
)

const Message = model('Message', messageSchema)

module.exports = Message;