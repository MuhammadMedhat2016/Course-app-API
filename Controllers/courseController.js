const Course = require("../Models/courseModel");
const Factory = require("../utils/factory");

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
