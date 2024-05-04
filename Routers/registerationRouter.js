const express = require("express");
const authController = require("../Controllers/authController");
const registerController = require("../Controllers/registerationController");
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route("/:courseId")
  .post(
    authController.restrictTo("user-student"),
    registerController.setReigsterationInfo,
    registerController.createRegs
  );

router.use(authController.restrictTo("admin"));

router.route("/").get(registerController.getAllRegs);
router.route("/:id").get(registerController.getOneRegs).delete(registerController.deleteRegs);

module.exports = router;
