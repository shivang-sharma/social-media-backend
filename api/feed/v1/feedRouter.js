const express = require('express');
const { FeedController } = require('./feedController');
const router = express.Router();

router.get('/', FeedController.get);

module.exports = {
    v1FeedRouter: router
}