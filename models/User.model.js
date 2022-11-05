const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      min: 8,
      required: [true, "Password is required."],
    },
    name: {
      type: String,
      unique: true,
      required: [true, "Username is required."],
      min: 5,
      max: 20,
      lowercase: true,
    },
    aboutMe: {
      type: String,
    },
    skills: {
      type: Array,
    },
    avatar: {
      type: String,
      default: "https://i.stack.imgur.com/frlIf.png",
    },
    cloudinary_id: {
      type: String,
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    collabProjects: {
      type: [{
        type: Schema.Types.ObjectId,
        ref:"Project"
      }]
    },
    ownProjects: {
      type: [{
        type: Schema.Types.ObjectId,
        ref:"Project"
      }]
    },
    samples: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: "Sample"
      }]
    },
    status: {
      type: String,
      enum: ["online", "offline"]
    }
},
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
