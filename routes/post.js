const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, postController.post);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPostById);
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;