const Registeration = require("../Models/registerationModel");
const Factory = require("../utils/factory");

exports.getAllRegs = Factory.getAll(Registeration);

exports.getOneRegs = Factory.getOne(Registeration);

exports.updateRegs = Factory.updateOne(Registeration);

exports.deleteRegs = Factory.deleteOne(Registeration);

exports.createRegs = Factory.createOne(Registeration);

exports.setReigsterationInfo = (req, _, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  req.body.user = req.user.id;
  if (req.params.courseId) {
    req.body.course = req.params.courseId;
  }
  next();
};
