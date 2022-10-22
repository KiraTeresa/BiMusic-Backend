const {Schema, model} = require('mongoose');

const feedbackSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            max: 30
        },
        text: {
            type: String,
            required: true,
            min: 100,
            max: 1000
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sample: {
            type: Schema.Types.ObjectId,
            ref: "Sample",
            required: true
        }
    },
    {
      timestamps: true,
    }
)

const Feedback = model('Feedback', feedbackSchema)

module.exports = Feedback;