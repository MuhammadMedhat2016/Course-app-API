const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "a user must have a first name"],
      minLength: 3,
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "a user must have a last name"],
      minLength: 3,
    },
    phone: {
      type: String,
      validate: {
        validator: validator.isNumeric,
        minLength: 11,
        maxLength: 11,
      },
    },
    age: {
      type: Number,
      min: 0,
    },
    email: {
      type: String,
      required: [true, "a user must have an email"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "entered email is in wrong format",
      },
    },

    password: {
      type: String,
      required: [true, "a user must have a password"],
      trim: true,
      select: false,
      minLength: [8, "password must be at least 8 characters"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "you must confirm your password"],
      validate: {
        validator: function (value) {
          console.log(this.password === value);
          return this.password === value;
        },
        message: "Password and Password Confirmation are not the same",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "a role must be user or admin",
      },
    },
    registerAs: {
      type: String,
      enum: {
        values: ["instructor", "student"],
        message: "user must be either an instructor or a student",
      },
    },
    photo: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
    active: {
      type: Boolean,
      default: true,
    },
    photo: {
      type: String,
      default: "default",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.registerAs && this.role !== "admin") {
    this.role = `user-${this.registerAs}`;
  }
  next();
});

userSchema.pre("save", async function (next) {
  // first check if the password field is actually modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const { photo } = this.getUpdate();
  if (photo) {
    const id = this.getFilter()._id;
    const course = await User.findById(id);
    await fs.unlink(`./public/img/course/${course.photo}`);
  }
  next();
});

userSchema.post("findOneAndDelete", async function (user, next) {
  if (user) await fs.unlink(`./public/img/course/${user.photo}`);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.passwrodChangedAfter = function (tokenIAT) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = Number.parseInt(this.passwordChangedAt.getTime() / 1000);
    return passwordChangedAtTimestamp > tokenIAT; // 400 > 200
  }
  return false;
};

userSchema.methods.generateRandomResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.statics.getHashedResetToken = function (resetToken) {
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  return hashedToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
