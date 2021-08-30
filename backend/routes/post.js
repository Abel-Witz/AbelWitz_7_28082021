const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const authMiddleware = require("../middlewares/auth");

// Posts routes
router.post("/", authMiddleware, postController.post);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPostById);
router.patch("/:id", authMiddleware, postController.modifyPost);
router.delete("/:id", authMiddleware, postController.deletePost);

// Rate a post
router.post("/:id/rate", authMiddleware, postController.ratePost);

module.exports = router;