const fs = require("fs/promises");

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
    summary: {
      type: String,
      required: [true, "a course must have a summary description"],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "a course must have a photo"],
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

courseSchema.pre("findOneAndUpdate", async function (next) {
  const { photo } = this.getUpdate();
  if (photo) {
    const id = this.getFilter()._id;
    const course = await Course.findById(id);
    await fs.unlink(`./public/img/course/${course.photo}`);
  }
  next();
});

courseSchema.post("findOneAndDelete", async function (course, next) {
  if (course) await fs.unlink(`./public/img/course/${course.photo}`);
  next();
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
