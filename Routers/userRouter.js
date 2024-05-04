const express = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");
const router = express.Router();

router.post("/sign-up", authController.signup);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/login", authController.login);

router.use(authController.protect);

router.patch("/update-profile", userController.upload, userController.resizeUserImage, userController.updateProfile);

router.get("/profile", authController.profile);

router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getAllUsers).post(userController.createUser);

router.route("/:id").get(userController.getOneUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
