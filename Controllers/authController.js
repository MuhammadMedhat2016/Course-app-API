const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const Course = require("../Models/courseModel");
const Registeration = require("../Models/registerationModel");
const APIError = require("../utils/apiError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const sendEmail = require("../utils/email");

exports.signup = catchAsyncErrors(async (req, res, next) => {
  delete req.body.role;
  const user = await User.create(req.body);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  user.password = undefined;
  res.status(201).json({
    stauts: "success",
    token,
    data: {
      user,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if the email and password already exists in the request
  if (!email || !password) {
    return next(
      new APIError(
        "please provide an email and password as login credentials",
        400
      )
    );
  }
  // 2) get the user based on the email address provided
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return next(new APIError("Incorrect Email Or Password", 401));

  // 3) sign a token and send it back to the client
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    stauts: "success",
    token,
  });
};

exports.protect = catchAsyncErrors(async (req, res, next) => {
  // check if the token exists in req headers and get it
  let token;
  if (req.headers.authorization)
    token = req.headers.authorization.split(" ")[1];

  if (!token)
    return next(
      new APIError("You are not logged in, please login first.", 401)
    );

  // Validate the token
  const { id, iat } = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // check if the user exists
  const user = await User.findById(id);
  if (!user) return next(new APIError("This User does no longer exist", 401));
  // check if the password has been changed recently after the token has been issued
  if (user.passwrodChangedAfter(iat)) {
    return next(
      new APIError(
        "Password has been changed recently, please login-in again",
        401
      )
    );
  }
  // grant access to the route (forward to next middleware)
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new APIError("You are not allowed to perform this action", 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // check if the email exists and get it
  const { email } = req.body;
  if (!email) {
    return next(new APIError("Please provide your email address", 400));
  }
  // find the user based on the email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new APIError("No user found with this email address", 400));
  }

  // get a random reset token
  const resetToken = user.generateRandomResetToken();

  await user.save({ validateBeforeSave: false });

  // send the reset URL to user email
  const message = `Hello, ${user.name}
  we've recieved request from you to reset your account password
  please send POST request to the following URL with your new password and password confirmation
  Reset URL: ${req.protocol}://${req.get(
    "host"
  )}/users/reset-password/${resetToken}
  if you did not request that, please ignore this email
  NOTE this link is only valid for 10 Mins
  Thanks
  Manage Course Family 
  `;
  try {
    const info = await sendEmail({
      to: user.email,
      subject: "Password Reset (Valid for 10 Mins)",
      text: message,
    });

    res.status(200).json({
      status: "success",
      message: "an reset token was sent to user email",
      data: null,
    });
  } catch (error) {
    user.passwordResetToken = user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new APIError(
        "an error occurred while sending email, please try again later",
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetToken = req.params.token;
  const hashedToken = User.getHashedResetToken(resetToken);
  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user || user.passwordResetTokenExpire.getTime() < Date.now()) {
    return next(
      new APIError(
        "the reset token is invalid or expired, please try again",
        400
      )
    );
  }
  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = user.passwordResetTokenExpire = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "password updated successfully",
    data: {
      user,
    },
  });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const id = req.user._id;
  const { passwordCurrent, password, passwordConfirm } = req.body;
  const user = await User.findById(id).select("+password");
  if (!(await user.comparePassword(passwordCurrent))) {
    return next(new APIError("The Current Password Is Invalid", 400));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;
  res.status(201).json({
    stauts: "success",
    token,
    data: {
      user,
    },
  });
});

exports.profile = (req, res, next) => {
  res.status(200).json({
    stauts: "success",
    data: {
      user: req.user,
    },
  });
};

exports.checkAccessibility = async (req, _, next) => {
  if (req.user.role === "admin") return next();
  if (req.params.courseId) {
    req.body.courseId = req.params.courseId;
  }
  if (!req.body.user) {
    req.body.userId = req.user._id;
  }
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return next(new APIError("incomplete information to provide access", 401));
  }

  const user = await User.findById(userId).select("role name");
  if (!user) {
    return next(
      new APIError(
        "Invalid user, you are not allowed to access this course materials",
        401
      )
    );
  }
  if (req.user.role.startsWith("user")) {
    const regs = await Registeration.findOne({
      course: courseId,
      user: userId,
    });
    const ins = await Course.findOne({ _id: courseId, instructor: userId });
    console.log(ins);
    if (!regs && !ins) {
      return next(
        new APIError("you are not allowed to access this course materials", 401)
      );
    }
  }
  delete req.body.userId;
  delete req.body.courseId;
  next();
};
