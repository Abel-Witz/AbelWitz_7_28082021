const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");
const authMiddleware = require("../middlewares/auth");

// Post comments
router.post("/", authMiddleware.force, commentController.postComment);
router.get("/", authMiddleware.free, commentController.getPostComments);
router.get("/:id", authMiddleware.free, commentController.getCommentById);
router.put("/:id", authMiddleware.force, commentController.modifyComment);
router.delete("/:id", authMiddleware.force, commentController.deleteComment);

// Rate a comment
router.post("/:id/rate", authMiddleware.force, commentController.rateComment);

module.exports = router;