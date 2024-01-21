const { Request, Response, NextFunction } = require("express");
const { validationResult, matchedData } = require("express-validator");
const { PostService } = require("./postService")
const logger = require("../../../logger")

class PostController {

    static postService = new PostService()
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     * @returns 
     */
    static async get(req, res, next) {
        try {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const param = matchedData(req);
                const authorId = param.authorId
                const response = await PostController.postService.getPost(authorId)
                if (response.error) {
                    return next({
                        message: response.error,
                        status: 404
                    })
                }
                return res.status(200).json(response.posts);
            }
            return res.status(403).send({ errors: result.array() });
        } catch (error) {
            logger.error(`${error.stack}`);
            next({
                message: "INTERNAL_SERVER_ERROR",
                status: 500
            })
        }
    }
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     * @returns 
     */
    static async post(req, res, next) {
        try {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const body = matchedData(req);
                const caption = body.caption;
                const file = req.file;
                const response = await PostController.postService.savePost(file, caption, req.user.id)
                if (response.error) {
                    logger.debug(response.error)
                    return next(
                        {
                            message: response.error,
                            status: 400
                        }
                    )
                }
                return res.status(200).json({
                    post: response.post,
                });
            }
            return res.status(403).send({ errors: result.array() });
        } catch (error) {
            logger.error(`${error.stack}`);
            next({
                message: "INTERNAL_SERVER_ERROR",
                status: 500
            })
        }
    }
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     * @returns 
     */
    static async delete(req, res, next) {
        try {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const param = matchedData(req);
                const postId = param.id
                const response = await PostController.postService.deletePost(postId, req.user.id)
                if (response.error) {
                    return next({
                        message: 'Post Not Found',
                        status: 404
                    })
                }
                return res.status(200).json(response.deletedPost);
            }
            return res.status(403).send({ errors: result.array() });
        } catch (error) {
            logger.error(`${error.stack}`);
            next({
                message: "INTERNAL_SERVER_ERROR",
                status: 500
            })
        }
    }
}
module.exports = {
    PostController
}