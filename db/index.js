const { default: mongoose } = require("mongoose");
const logger = require("../logger");

const URI = 'mongodb://root:password@127.0.0.1:27017'
const connection = mongoose.createConnection(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const { UserSchema } = require("./schemas/UserSchema");
const { PostSchema } = require("./schemas/PostSchema");
const { CommentSchema } = require("./schemas/CommentSchema");

const User = connection.model("User", UserSchema);
const Comment = connection.model('Comment', CommentSchema);
const Post = connection.model('Post', PostSchema);

module.exports = {
    connection,
    User,
    Comment,
    Post,
};