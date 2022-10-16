const {Schema, model} = require('mongoose');
const User = require('./User.model');
const Project = require('./Project.model')

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            max: 100
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: User,
            required: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: Project,
            required: true
        }
    }
)

const Comment = model('Comment', commentSchema)

module.exports = Comment;