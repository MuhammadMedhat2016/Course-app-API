const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "a course must have a name"],
      minLength: 3,
    },
    price: {
      type: Number,
      min: 0,
      required: [true, "a course must have a price"],
    },
    description: {
      type: String,
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    instructor: {
      type: mongoose.Types.ObjectId,
      required: [true, "a course must have an instructor"],
      ref: "User",
    },
    skills: [String],
  },
  {
    timestamps: true,
  }
);



const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
