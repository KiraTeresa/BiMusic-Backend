const { Schema, model } = require("mongoose");

const sampleSchema = new Schema(
  {
    link: {
      type: String,
      required: [true, "Link is required."],
    },
    linkType: {
      type: String,
      required: [true, "LinkType is required."],
    },
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref:User,
        required: [true],
      },
   description: {
      type: String,
    },
    genre: {
      type: [{
        type: String
    }],
    },
    year: {
      type: Number,
    },
    feedback: {
        type: Schema.Types.ObjectId,
        ref:Feedback,
        required: [true],
      },
    public: {
      type: Boolean,
      required: [true],
    },
    
},
  {
    timestamps: true,
  }
);

const Sample = model("Sample", sampleSchema);

module.exports = Sample;