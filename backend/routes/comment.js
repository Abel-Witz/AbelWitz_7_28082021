const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");
const authMiddleware = require("../middlewares/auth");

// Post comments
router.post("/", authMiddleware, commentController.postComment);
router.get("/", commentController.getPostComments);
router.get("/:id", commentController.getCommentById);
router.put("/:id", authMiddleware, commentController.modifyComment);
router.delete("/:id", authMiddleware, commentController.deleteComment);

// Rate a comment
router.post("/:id/rate", authMiddleware, commentController.rateComment);

module.exports = router;