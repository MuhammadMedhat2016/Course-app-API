const path = require("path");


const sharp = require("sharp");
const multer = require("multer");

const Course = require("../Models/courseModel");
const Factory = require("../utils/factory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

exports.getAllCourses = Factory.getAll(Course);

exports.getOneCourse = Factory.getOne(Course);

exports.updateCourse = Factory.updateOne(Course);

exports.deleteCourse = Factory.deleteOne(Course);

exports.createCourse = Factory.createOne(Course);

exports.setCourseId = (req, res, next) => {
  if (!req.body.instructor) {
    req.body.instructor = req.user.id;
  }
  next();
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const acceptedExtensionsList = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname);
  if (acceptedExtensionsList.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("the image should be of type jpg, jpeg or png only"), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
}).single("photo");

exports.resizeCourseImage = catchAsyncErrors(async (req, _, next) => {
  if (req.file) {
    const fileName = `course-${req.file.originalname.split(".")[0]}-${Date.now()}`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/course/${fileName}`);
    req.body.photo = fileName;
  }
  next();
});
