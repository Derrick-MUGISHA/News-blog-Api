const Article = require('../model/Article');

// Helper function for API responses
const respond = (res, status, data = null, message = '') => {
  res.status(status).json({
    status: status >= 400 ? 'error' : 'success',
    data,
    message
  });
};

// Get all articles with filters
exports.getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, author, sort = '-publishedAt', q } = req.query;
    const query = {};

    if (category) query.category = category;
    if (author) query.author = author;
    if (q) query.title = { $regex: q, $options: 'i' };

    const articles = await Article.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Article.countDocuments(query);

    respond(res, 200, {
      articles,
      totalResults: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    respond(res, 500, null, err.message);
  }
};

// Get single article
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findOne({ urlSlug: req.params.slug });
    if (!article) return respond(res, 404, null, 'Article not found');
    respond(res, 200, article);
  } catch (err) {
    respond(res, 500, null, err.message);
  }
};

// Create article
exports.createArticle = async (req, res) => {
  try {
    const { title, content, author, category, tags, featuredImage, source } = req.body;
    
    // Generate URL slug from title
    const urlSlug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newArticle = await Article.create({
      title,
      content,
      author,
      category,
      tags,
      featuredImage,
      source,
      urlSlug
    });

    respond(res, 201, newArticle, 'Article created successfully');
  } catch (err) {
    respond(res, 400, null, err.message);
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const updatedArticle = await Article.findOneAndUpdate(
      { urlSlug: req.params.slug },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedArticle) return respond(res, 404, null, 'Article not found');
    respond(res, 200, updatedArticle, 'Article updated successfully');
  } catch (err) {
    respond(res, 400, null, err.message);
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ urlSlug: req.params.slug });
    if (!article) return respond(res, 404, null, 'Article not found');
    respond(res, 204);
  } catch (err) {
    respond(res, 500, null, err.message);
  }
};