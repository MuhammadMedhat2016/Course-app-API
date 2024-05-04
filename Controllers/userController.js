const path = require("path");

const sharp = require("sharp");
const multer = require("multer");

const User = require("../Models/userModel");
const Factory = require("../utils/factory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const APIError = require("../utils/apiError");

exports.getAllUsers = Factory.getAll(User);

exports.getOneUser = Factory.getOne(User);

exports.updateUser = Factory.updateOne(User);

exports.deleteUser = Factory.deleteOne(User);

exports.createUser = Factory.createOne(User);

function filter(obj, ...props) {
  const newObj = {};
  props.forEach((prop) => (newObj[prop] = obj[prop]));
  return newObj;
}

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const id = req.user.id;
  if (password || passwordConfirm) {
    return next(
      new APIError(
        "you can not update your password using /update-profile route, please use /update-password route",
        400
      )
    );
  }
  const filterdData = filter(req.body, "email", "firstName", "lastName", "phone", "photo", "age");
  const user = await User.findByIdAndUpdate(id, filterdData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

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

exports.resizeUserImage = catchAsyncErrors(async (req, _, next) => {
  if (req.file) {
    const fileName = `user-${req.user._id}-${Date.now()}`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/user/${fileName}`);
    req.body.photo = fileName;
  }
  next();
});
