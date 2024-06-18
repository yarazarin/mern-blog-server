// server/middleware/uploadToGitHub.js
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const path = require('path');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'yarazarin';
const repo = 'mern-blog-server';

const uploadToGitHub = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
  const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });

  try {
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `uploads/${req.file.filename}`,
      message: `upload image ${req.file.filename}`,
      content: fileContent,
      committer: {
        name: 'Your Name',
        email: 'your-email@example.com',
      },
      author: {
        name: 'Your Name',
        email: 'your-email@example.com',
      },
    });

    req.file.url = response.data.content.download_url;
    fs.unlinkSync(filePath); // Delete local file after upload
    next();
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    res.status(500).json({ message: 'Error uploading image to GitHub' });
  }
};

module.exports = uploadToGitHub;
