const {Schema, model} = require('mongoose');

const chatSchema = new Schema(
    {
        project: {
                type: Schema.Types.ObjectId,
                ref: "Project"
      },
        history: {
            type: [{
            type: Schema.Types.ObjectId,
            ref: "Message"}
        ]}
    },
    {
      timestamps: true,
    }
)

const Chat = model('Chat', chatSchema)

module.exports = Chat;