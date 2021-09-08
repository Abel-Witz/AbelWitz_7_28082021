const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/:id", userController.getUser);
router.post("/update", authMiddleware.force, userController.update);
router.post("/delete", authMiddleware.force, userController.delete);

module.exports = router;