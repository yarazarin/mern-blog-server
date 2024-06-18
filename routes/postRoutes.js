//server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Add a new post
router.post('/', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    } else {
      const { title, content } = req.body;
      let imageUrl = '';

      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        imageUrl = await uploadToGitHub(req.file.buffer, filename);
      }

      try {
        const newPost = new Post({
          title,
          content,
          image: imageUrl,
          author: req.user.id
        });

        const post = await newPost.save();
        res.status(201).json(post);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });
});


// Get all posts - public access
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single post by ID - public access
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post
router.put('/:id', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    } else {
      const { title, content } = req.body;
      let imageUrl = req.body.image;

      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        imageUrl = await uploadToGitHub(req.file.buffer, filename);
      }

      try {
        const post = await Post.findById(req.params.id);

        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.image = imageUrl;

        await post.save();
        res.json(post);
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Delete image file if it exists
    if (post.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', post.image);
      fs.unlinkSync(imagePath);
    }

    await post.deleteOne();

    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;