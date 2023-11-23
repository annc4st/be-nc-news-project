const express = require('express');
const articleRouter = express.Router();
const { getArticles, getArticleById, 
    patchArticle, getCommentsForArticle, postComment, postArticle
} = require('../controllers/controllers.js');

articleRouter
.route('/')
.get(getArticles)
.post(postArticle);

articleRouter
.route('/:article_id')
.get(getArticleById)
.patch(patchArticle);

articleRouter
.route('/:article_id/comments')
.get(getCommentsForArticle)
.post(postComment);


module.exports = articleRouter;