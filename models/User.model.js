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
      required: [true, "Username is required."],
      min: 5,
      max: 20,
      lowercase: true,
    },
    // firstName: {
    //   type: String,
    //   required: [true, "First name is required."],
    // },
    // lastName: {
    //   type: String,
    //   required: [true, "Last name is required."],
    // },
    aboutMe: {
      type: String,
    },
    skills: {
      type: Array,
    },
    avatar: {
      type: String,
    },
    cloudinary_id: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
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
},
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
