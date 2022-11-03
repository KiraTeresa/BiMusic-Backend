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
        readBy: {
          type: [{
            type: Schema.Types.ObjectId,
            ref: "User"}]
        }
    },
    {
      timestamps: true,
    }
)

const Message = model('Message', messageSchema)

module.exports = Message;