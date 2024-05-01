const User = require("../Models/userModel");
const Factory = require("../utils/factory");

exports.getAllUsers = Factory.getAll(User);

exports.getOneUser = Factory.getOne(User);

exports.updateUser = Factory.updateOne(User);

exports.deleteUser = Factory.deleteOne(User);

exports.createUser = Factory.createOne(User);
