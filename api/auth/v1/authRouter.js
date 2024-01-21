
const express = require('express');
const { email, username, firstname, lastname, password } = require('../../../validators');
const { AuthController } = require('./authController');
const router = express.Router();


router.post('/login',
    email(),
    password(),
    AuthController.login
);
router.post(
    '/register',
    email(),
    username(),
    firstname(),
    lastname(),
    password(),
    AuthController.register
)
module.exports = {
    v1AuthRouter: router
}