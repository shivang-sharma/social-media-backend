const { body, param } = require('express-validator');

function caption() {
    return body("caption").notEmpty().isString().escape();
}
function id() {
    return param("id").notEmpty().isAlphanumeric();
}
function authorId() {
    return param("authorId").notEmpty().isAlphanumeric();
}
function postId() {
    return param("postId").notEmpty().isAlphanumeric();
}
function email() {
    return body("email").notEmpty().isEmail();
}
function username() {
    return body("username").notEmpty().isAlpha();
}
function firstname() {
    return body("firstname").notEmpty().isAlpha();
}
function lastname() {
    return body("lastname").notEmpty().isAlpha();
}
function password() {
    return body("password").notEmpty().isStrongPassword();
}
function comment() {
    return body("comment").notEmpty().isString().escape();
}
module.exports = {
    email,
    username,
    firstname,
    lastname,
    password,
    caption,
    id,
    comment,
    postId,
    authorId
}