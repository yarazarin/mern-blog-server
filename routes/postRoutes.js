// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const uploadToGitHub = require('../middleware/uploadToGitHub');
const path = require('path');
const fs = require('fs');

// Add a new post
router.post('/', auth, upload, uploadToGitHub, async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.url : '';

  try {
    const newPost = new Post({
      title,
      content,
      image,
      author: req.user.id
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post
router.put('/:id', auth, upload, uploadToGitHub, async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.url : undefined;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    if (image) post.image = image;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Delete image file if it exists
    if (post.image) {
      const fileName = path.basename(post.image);
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: `uploads/${fileName}`,
        message: `delete image ${fileName}`,
        sha: (await octokit.repos.getContent({
          owner,
          repo,
          path: `uploads/${fileName}`,
        })).data.sha,
        committer: {
          name: 'Your Name',
          email: 'your-email@example.com',
        },
        author: {
          name: 'Your Name',
          email: 'your-email@example.com',
        },
      });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
