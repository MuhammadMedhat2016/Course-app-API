const fs = require("fs/promises");
const Lecture = require("../Models/lectureModel");
const APIError = require("../utils/apiError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllLectures = catchAsyncErrors(async (req, res, next) => {
  delete req.query.course;
  const query = Lecture.find({ course: req.params.courseId });
  const features = new APIFeatures(query, req.query).select().sort().filter().paginate();
  const lectures = await features.MongooseQuery;
  res.status(200).json({
    status: "success",
    data: {
      data: lectures,
    },
  });
});

exports.getOneLecture = catchAsyncErrors(async (req, res, next) => {
  const query = Lecture.findOne({ _id: req.params.id, course: req.params.courseId });
  const features = new APIFeatures(query, req.query).select();
  const lecture = await features.MongooseQuery;
  if (!lecture) {
    return next(new APIError("There is no such lecture on the specified course", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: lecture,
    },
  });
});

exports.createLecture = catchAsyncErrors(async (req, res, next) => {
  req.body.resource = req.file.filename;
  req.body.course = req.params.courseId;
  try {
    const lecture = await Lecture.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        data: lecture,
      },
    });
  } catch (error) {
    await fs.unlink(`./lectures/${req.file.filename}`);
    return next(error);
  }
});

exports.updateLecture = catchAsyncErrors(async (req, res, next) => {
  if (req.file) req.body.resource = req.file.filename;
  try {
    const lecture = await Lecture.findOneAndUpdate({ _id: req.params.id, course: req.params.course }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lecture) {
      return next(new APIError(`No lecture found with this id ${req.params.id}`, 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: lecture,
      },
    });
  } catch (error) {
    await fs.unlink(`./lectures/${req.file.filename}`);
    return next(error);
  }
});

exports.deleteLecture = catchAsyncErrors(async (req, res, next) => {
  const lecture = await Lecture.findOneAndDelete({ _id: req.params.id, course: req.params.courseId });
  console.log(lecture);
  if (!lecture) {
    return next(new APIError(`No lecture found with this id ${req.params.id}`, 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
