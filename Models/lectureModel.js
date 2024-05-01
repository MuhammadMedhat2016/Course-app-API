const fs = require("fs/promises");
const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      required: [true, "a comment must have a content"],
    },
    author: {
      type: mongoose.Types.ObjectId,
      required: [true, "a comment must have a author"],
    },
  },
  {
    _id: false,
    id: false,
    timestamps: true,
  }
);

const lectureSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "a lecture must have a name"],
      minLength: 3,
      unique: [true, "a lecure name must be unique"],
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Types.ObjectId,
      required: [true, "a lecture must belong to a course"],
    },
    resource: {
      type: String,
      required: [true, "a lecture must have a resource"],
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

lectureSchema.pre("findOneAndUpdate", async function (next) {
  const { resource } = this.getUpdate();
  if (resource) {
    console.log(resource);
    const id = this.getFilter()._id;
    const lecture = await Lecture.findById(id);
    await fs.unlink(`./lectures/${lecture.resource}`);
  }
});

lectureSchema.post("findOneAndDelete", async function (lecture, next) {
  if(lecture) await fs.unlink(`./lectures/${lecture.resource}`);
  next();
});

const Lecture = mongoose.model("Lecture", lectureSchema);
module.exports = Lecture;
