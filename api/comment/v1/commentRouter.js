
const express = require('express');
const { postId, id, comment } = require('../../../validators');
const { CommentController } = require('./commentController');
const router = express.Router();


router.get('/:postId', postId(), CommentController.get);
router.post('/:postId', postId(), comment(), CommentController.post);
router.delete('/:postId/:id', postId(), id(), CommentController.deleteComment);

module.exports = {
    v1CommentRouter: router
}