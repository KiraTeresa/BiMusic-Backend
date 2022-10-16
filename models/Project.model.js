const {Schema, model} = require ('mongoose');
const User = require('./User.model');
const Comment = require('./Comment.model')
const Sample = require('./Sample.model')

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
        genre: {
            type: [{
              type: String
          }],
          },
        lookingFor: {
            type: Array,
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
        collaborators:{
            type: [{
                type: Schema.Types.ObjectId,
                ref: User}]
        },
        pendingCollabs: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: User}]
        },
         comments:{
            type: [{
                type: Schema.Types.ObjectId,
                ref: Comment}]
        },
         sample: {
            type: Schema.Types.ObjectId,
            ref: Sample
         }
    },
    {
      timestamps: true,
    }
)

const Project = model("Project", projectSchema);

module.exports = Project;