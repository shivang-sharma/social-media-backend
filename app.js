require("dotenv").config()
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const hpp = require("hpp");
const passport = require("passport")
const multer = require("multer");

const logger = require('./logger');
const limiter = require('./middleware/rate-limiter');
const corsMiddleware = require('./middleware/cors-middleware');
const { v1AuthRouter } = require("./api/auth/v1/authRouter");
const { v1PostRouter } = require("./api/post/v1/postRouter");
const { v1CommentRouter } = require("./api/comment/v1/commentRouter");
const { v1FeedRouter } = require("./api/feed/v1/feedRouter");

const app = express();

// // Initializing passport 
// require('./middleware/passport');

// Apply the rate limiting middleware to all requests
app.use(limiter)
logger.info("Attached rate-limiter");

app.disable('x-powered-by');
logger.info("Disabled x-powered-by");

app.use(compression());
logger.info("Attached compression");

app.use(helmet());
logger.info("Attached helmet");

app.set('trust proxy', 1);
logger.info("Set proxy 1");

app.use(express.urlencoded({ extended: true }));
logger.info("Attached urlencoded parser");

app.use(express.json());
logger.info("Attached json parser");

app.use(hpp());
logger.info("Attached hpp");

app.options('*', corsMiddleware);
logger.info("Configured cors ...");

app.get("/api/health", (req, res, next) => {
    res.send("Healthy");
})
app.use("/api/v1/auth", v1AuthRouter)
app.use("/api/v1/post", passport.authenticate('jwt', { session: false }), v1PostRouter)
app.use("/api/v1/comment", passport.authenticate('jwt', { session: false }), v1CommentRouter)
app.use("/api/v1/feed", passport.authenticate('jwt', { session: false }), v1FeedRouter)

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        res.status(400).send('Error uploading file: ' + error.message);
    } else if (error.status) {
        res.status(error.status).send('Error: ' + error.message);
    } else {
        next();
    }
});


module.exports = {
    app
};