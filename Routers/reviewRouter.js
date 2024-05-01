const express = require("express");
const authController = require("../Controllers/authController");
const reviewController = require("../Controllers/reviewController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get(
  "/",
  (req, _, next) => {
    if (req.params.courseId) {
      req.query.course = req.params.courseId;
    }
    next();
  },
  reviewController.getAllReviews
);

router.get("/:id", reviewController.getOneReview);

router.use(authController.checkAccessibility);
router.use(authController.restrictTo("user-student"));

router.route("/").post(reviewController.setReviewIds, reviewController.createReview);
router.route("/:id").patch(reviewController.updateReview).delete(reviewController.deleteReview);

module.exports = router;
