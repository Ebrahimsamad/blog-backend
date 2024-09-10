const Post = require("../models/postModel");
const asyncHandler = require("express-async-handler");
const imagekit = require("../utils/imageKit");

const addPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  let imageUrl = "";

  if (req.file) {
    const imageFile = req.file.buffer.toString("base64");
    try {
      const uploadResponse = await imagekit.upload({
        file: imageFile,
        fileName: `post_${Date.now()}`,
      });
      imageUrl = uploadResponse.url;
    } catch (error) {
      return res.status(500).json({ message: "Image upload failed", error });
    }
  }

  const newPost = new Post({
    title,
    content,
    imageUrl,
    author: req.user._id,
  });

  const post = await newPost.save();
  res.status(201).json(post);
});

const getPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate("comments.userId", "username")
      .populate("likes", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    if (req.file) {
      const imageFile = req.file.buffer.toString("base64");
      try {
        const uploadResponse = await imagekit.upload({
          file: imageFile,
          fileName: `post_${Date.now()}`,
        });
        post.imageUrl = uploadResponse.url;
      } catch (error) {
        return res.status(500).json({ message: "Image upload failed", error });
      }
    }

    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "likes",
      "username"
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userId = req.user._id;

    const alreadyLiked = post.likes.some(
      (like) => like._id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) => like._id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      likedByUser: !alreadyLiked,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      text: req.body.text,
      userId: req.user._id,
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(req.params.id).populate(
      "comments.userId",
      "username"
    );

    res.status(201).json(populatedPost.comments.pop());
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Error adding comment" });
  }
};

module.exports = {
  addPost,
  getPosts,
  deletePost,
  editPost,
  likePost,
  commentPost,
};
