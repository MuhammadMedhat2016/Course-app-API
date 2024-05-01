const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const multer = require("multer");
const authController = require("../Controllers/authController");
const lectureController = require("../Controllers/lectureController");
const Lecture = require("../Models/lectureModel");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./lectures");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${req.params.courseId || req.body.course}-${req.user._id}-${timestamp}-${file.originalname}`;
    cb(null, filename);
  },
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (file.mimetype.startsWith("video/") || ext === ".pdf") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_FILE_TYPE", "Only videos or PDFs files are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
}).single("resource");

const router = express.Router({ mergeParams: true });

router.use(authController.checkAccessibility);

router
  .route("/")
  .get(lectureController.getAllLectures)
  .post(authController.restrictTo("user-instructor"), upload, lectureController.createLecture);

router
  .route("/:id")
  .get(lectureController.getOneLecture)
  .patch(authController.restrictTo("user-instructor"), upload, lectureController.updateLecture)
  .delete(authController.restrictTo("user-instructor"), lectureController.deleteLecture);

module.exports = router;
