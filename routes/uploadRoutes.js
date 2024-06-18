const express = require('express');
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = path.join(__dirname, '..', req.file.path);
  const fileContent = fs.readFileSync(filePath, 'base64');
  const fileName = req.file.originalname;

  try {
    const response = await axios.put(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/contents/${fileName}`,
      {
        message: `Upload ${fileName}`,
        content: fileContent,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    // Clean up the uploaded file from server
    fs.unlinkSync(filePath);

    res.json({ url: response.data.content.download_url });
  } catch (err) {
    console.error('Error uploading image to GitHub:', err);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

module.exports = router;
