// server/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../models/Post");

// Add a new post
router.post("/", auth, async (req, res) => {
    const {
        title,
        content,
        imageUrl,
        tags,
        date,
        addToManual,
    } = req.body; // Include tags

    if (!tags || tags.length === 0) {
        return res
            .status(400)
            .json({ message: "Tags are required" });
    }

    try {
        const newPost = new Post({
            title,
            content,
            imageUrl,
            author: req.user.id,
            tags,
            date: new Date(date).toISOString(),
            addToManual: addToManual || false,
        });

        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get all posts - public access
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().sort({
            createdAt: -1,
        });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get posts by tag - public access
router.get("/tag/:tag", async (req, res) => {
    const { tag } = req.params;
    try {
        const posts = await Post.find({ tags: tag }).sort({
            createdAt: -1,
        });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get a single post by ID - public access
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post)
            return res
                .status(404)
                .json({ message: "Post not found" });
        // Increment view count
        post.viewCount += 1;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update a post
router.put("/:id", auth, async (req, res) => {
    const {
        title,
        content,
        imageUrl,
        tags,
        date,
        addToManual,
    } = req.body; // Include tags

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found" });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.imageUrl = imageUrl || post.imageUrl;
        post.tags = tags || post.tags;
        post.date = new Date(date);
        post.addToManual =
            addToManual !== undefined
                ? addToManual
                : post.addToManual;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a post
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post)
            return res
                .status(404)
                .json({ message: "Post not found" });

        await post.deleteOne();
        res.json({ message: "Post removed" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get highlighted posts - public access
router.get("/manual", async (req, res) => {
    try {
        const manualPosts = await Post.find({
            addToManual: true,
        }).sort({ createdAt: -1 });
        res.json(manualPosts);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get blog statistics - protected for admin
router.get("/stats", auth, async (req, res) => {
    try {
        const totalPosts = await Post.countDocuments();
        const totalViews = await Post.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$viewCount" },
                },
            },
        ]);
        const views =
            totalViews.length > 0 ? totalViews[0].total : 0;
        const topPosts = await Post.find()
            .sort({ viewCount: -1 })
            .limit(5)
            .select("title viewCount");
        res.json({
            totalPosts,
            totalViews: views,
            topPosts,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
