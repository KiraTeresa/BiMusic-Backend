const {Schema, model} = require ('mongoose');
const User = require('./User.model');

const projectSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required."]
        },
        shortDescription: {
            type: String,
            max: 150,
            required: [true, "Short description is required."]
        },
        longDescription: {
            type: String,
            min: 200,
            max: 1000,
            required: [true, "Long description is required."]
        },
        genre: Array,
        lookingFor: {
            type: [{
            num: Number,
            skill: String
            }],
            required: [true, "Please choose at least one option."]
            },
        startDate: Date,
        endDate: Date,
        isRemote: {type: Boolean, required: true},
        city: {type: String, required: true},
        country: {type: String, required: true},
        initiator: {
            type: Schema.Types.ObjectId,
            ref: User,
            required: true
        },
        collaborators: [
           {type: Schema.Types.ObjectId,
            ref: User}
        ],
        pendingCollabs: [
            {type: Schema.Types.ObjectId,
             ref: User}
         ],
         comments: {
            type: Schema.Types.ObjectId,
            ref: Comment
         },
         sample: {
            type: Schema.Types.ObjectId,
            ref: Sample
         }
    }
)

const Project = model("Project", projectSchema)

module.exports = Project;