const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articles');

// API Key verification middleware
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized - Invalid API Key'
    });
  }
  next();
};

router.route('/')
  .get(getArticles)
  .post(verifyApiKey, createArticle);

router.route('/:slug')
  .get(getArticle)
  .patch(verifyApiKey, updateArticle)
  .delete(verifyApiKey, deleteArticle);

module.exports = router;