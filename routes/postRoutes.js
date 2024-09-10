const express = require("express");
const {
  addPost,
  getPosts,
  deletePost,
  likePost,
  commentPost,
  editPost,
} = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.get("/", getPosts);
router.post("/", authMiddleware, upload.single("image"), addPost);
router.delete("/:id", authMiddleware, deletePost);
router.put("/:id", authMiddleware, upload.single("image"), editPost);
router.put("/:id/like", authMiddleware, likePost);
router.post("/:id/comment", authMiddleware, commentPost);

module.exports = router;
