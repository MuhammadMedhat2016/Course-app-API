const mongoose = require("mongoose");

const registerationSchema = mongoose.Schema({
  course: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
    required: [true, "a registeration must be done on a course"],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "a registeration must be done from a user"],
  },
  purchaseDate: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    min: 0,
    required: [true, "a purchase must have a price"],
  },
});

const Registeration = mongoose.model("Registeration", registerationSchema);
module.exports = Registeration;
