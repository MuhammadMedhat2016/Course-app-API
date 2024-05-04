const stripe = require("stipe");

const Registeration = require("../Models/registerationModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Course = require("../Models/courseModel");
const Factory = require("../utils/factory");
const APIError = require("../utils/apiError");

exports.getAllRegs = Factory.getAll(Registeration);

exports.getOneRegs = Factory.getOne(Registeration);

exports.deleteRegs = Factory.deleteOne(Registeration);

exports.createRegs = Factory.createOne(Registeration);

exports.setReigsterationInfo = (req, _, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  req.body.user = req.user.id;
  req.body.course = req.params.courseId;
  next();
};
