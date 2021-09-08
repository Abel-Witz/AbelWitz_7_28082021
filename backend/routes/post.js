const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const authMiddleware = require("../middlewares/auth");

// Posts routes
router.post("/", authMiddleware.force, postController.post);
router.get("/", authMiddleware.free, postController.getPosts);
router.get("/:id", authMiddleware.free, postController.getPostById);
router.delete("/:id", authMiddleware.force, postController.deletePost);

// Rate a post
router.post("/:id/rate", authMiddleware.force, postController.ratePost);

module.exports = router;