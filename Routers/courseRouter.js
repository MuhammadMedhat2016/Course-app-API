const express = require("express");
const authController = require("../Controllers/authController");
const courseController = require("../Controllers/courseController");
const registerationRouter = require("./registerationRouter");
const lectureRouter = require("./lectureRouter");
const reviewRouter = require("./reviewRouter");

const router = express.Router();

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo("user-instructor", "admin"),
    courseController.setCourseId,
    courseController.createCourse
  );

router.use("/:courseId/reviews", reviewRouter);

router.use(authController.protect);

router.use("/:courseId/register", registerationRouter);
router.use("/:courseId/lectures", lectureRouter);

router
  .route("/:id")
  .get(courseController.getOneCourse)
  .patch(authController.restrictTo("user-instructor", "admin"), courseController.updateCourse)
  .delete(authController.restrictTo("user-instructor", "admin"), courseController.deleteCourse);

module.exports = router;
