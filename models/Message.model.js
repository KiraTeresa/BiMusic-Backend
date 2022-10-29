const {Schema, model} = require('mongoose');

const messageSchema = new Schema(
    {
        author: {
                type: Schema.Types.ObjectId,
                ref: "User"
      },
        text: {
            type: String
        }
    },
    {
      timestamps: true,
    }
)

const Message = model('Message', messageSchema)

module.exports = Message;