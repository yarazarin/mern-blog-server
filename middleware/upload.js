const multer = require('multer');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'yarazarin';
const repo = 'mern-blog-server';

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit to 10MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image'); // Handle single file upload with field name 'image'

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

async function uploadToGitHub(buffer, filename) {
  const content = buffer.toString('base64');
  const path = `uploads/${filename}`;

  try {
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Upload ${filename}`,
      content,
      committer: {
        name: 'Your Name',
        email: 'your-email@example.com'
      },
      author: {
        name: 'Your Name',
        email: 'your-email@example.com'
      }
    });
    return response.data.content.download_url;
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    throw error;
  }
}

module.exports = { upload, uploadToGitHub };
