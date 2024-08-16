// routes/tags.js

const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Adjust the path as necessary

// GET /tags
router.get('/', async (req, res) => {
  try {
    const tags = await Post.distinct("tags");
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
