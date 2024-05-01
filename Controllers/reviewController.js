const Review = require("../Models/reviewModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Factory = require("../utils/factory");
const APIError = require("../utils/apiError");

exports.getAllReviews = Factory.getAll(Review);

exports.getOneReview = Factory.getOne(Review);

exports.deleteReview = Factory.deleteOne(Review);

exports.createReview = Factory.createOne(Review);

exports.setReviewIds = (req, res, next) => {
  req.body.author = req.body.author || req.user.id;
  req.body.course = req.body.course || req.params.courseId;
  next();
};

exports.updateReview = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user._id;
  const course_id = req.params.courseId || req.body.course;

  const review = await Review.findOneAndUpdate({ _id: req.params.id, course: course_id, author: user_id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    return next(
      new APIError("You can not update this review maybe it does not exist, or it does not belong to you", 400)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      data: review,
    },
  });
});

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user._id;
  const course_id = req.params.courseId || req.body.course;

  const review = await Review.findOneAndDelete({ _id: req.params.id, course: course_id, author: user_id });
  if (!review) {
    return next(
      new APIError("You can not remove this review maybe it does not exist, or it does not belong to you", 400)
    );
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
