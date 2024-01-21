
const express = require('express');
const { upload } = require("../../../middleware//multer-middleware")
const { caption, id, authorId } = require('../../../validators');
const { PostController } = require('./postController');
const router = express.Router();


router.get('/:authorId', authorId(), PostController.get);
router.post('/', upload.single('file'), caption(), PostController.post);
router.delete('/:id', id(), PostController.delete);

module.exports = {
    v1PostRouter: router
}