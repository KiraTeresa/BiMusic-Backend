const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
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
    username: {
      type: String,
      required: [true, "Username is required."],
      min: 5,
      max: 20,
    },
    firstName: {
      type: String,
      required: [true, "First name is required."],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
    },
    aboutMe: {
      type: String,
    },
    skills: {
      type: [{
        type: String
    }],
      required: [true, "Skills are required."],
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
      type: Schema.Types.ObjectId,
      ref:Project
    },
    ownProjects: {
      type: Schema.Types.ObjectId,
      ref:Projects
    },
},
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
