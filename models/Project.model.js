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
        location: {
            type: {isRemote: Boolean, city: String, country: String}
        },
        initiator: {
            type: ObjectId,
            ref: User,
            required: true
        },
        collaborators: [
           {type: ObjectId,
            ref: User}
        ],
        pendingCollabs: [
            {type: ObjectId,
             ref: User}
         ],
         comments: {
            type: ObjectId,
            ref: Comment
         },
         sample: {
            type: ObjectId,
            ref: Sample
         }
    }
)

const Project = model("Project", projectSchema)

module.exports = Project;