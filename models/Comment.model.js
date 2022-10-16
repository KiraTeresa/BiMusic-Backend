const {Schema, model} = require('mongoose');

const commentSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
        max: 100,
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },
    },
    {
      timestamps: true,
    }
)

const Comment = model('Comment', commentSchema)

module.exports = Comment;