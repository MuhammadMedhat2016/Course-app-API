const mongoose = require("mongoose");
const Course = require("./courseModel");
const reviewSchema = mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, "the minimum rating is ZERO"],
      max: [5, "the maximum rating is FIVE"],
      required: [true, "a review must have a rating"],
    },
    author: {
      type: mongoose.Types.ObjectId,
      required: [true, "a review must have an author"],
    },
    course: {
      type: mongoose.Types.ObjectId,
      required: [true, "a review must belong to a course"],
    },
  },
  {
    timestamps: true,
  }
);
reviewSchema.statics.calculateRatings = async function (crsId) {
  const aggregateResult = await this.aggregate([
    {
      $match: { course: crsId },
    },
    {
      $group: {
        _id: "$course",
        ratings: { $avg: "$rating" },
        quantity: { $count: {} },
      },
    },
  ]);
  if (aggregateResult.length !== 0) {
    await Course.findByIdAndUpdate(crsId, {
      ratingsAverage: aggregateResult[0].ratings,
      ratingsQuantity: aggregateResult[0].quantity,
    });
  } else {
    await Course.findByIdAndUpdate(crsId, {
      ratingsAverage: 1,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.index({ author: 1, course: 1 }, { unique: true });

reviewSchema.post("save", function (doc, next) {
  if (doc) Review.calculateRatings(doc.course);
  next();
});

reviewSchema.post(/^findOneAnd/, function (doc, next) {
  if (doc) Review.calculateRatings(doc.course);
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
