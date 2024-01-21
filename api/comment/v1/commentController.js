const { Request, Response, NextFunction } = require("express");
const { validationResult, matchedData } = require("express-validator");
const { CommentService } = require("./commentService")
const logger = require("../../../logger")

class CommentController {
    static commentService = new CommentService()

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     */
    static async get(req, res, next) {
        try {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const param = matchedData(req);
                const postId = param.postId
                const response = await CommentController.commentService.getComment(postId)
                if (response.error) {
                    logger.debug(response.error)
                    return next({
                        message: response.error,
                        status: 404
                    })
                }
                return res.status(200).json(response.comments);
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
                const bodyAndParam = matchedData(req);
                const postId = bodyAndParam.postId;
                const comment = bodyAndParam.comment;
                const response = await CommentController.commentService.postComment(postId, comment, req.user.id)
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
                    comment: response.comment,
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
    static async deleteComment(req, res, next) {
        try {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const param = matchedData(req);
                const postId = param.postId;
                const id = param.id;
                const response = await CommentController.commentService.deleteComment(postId, id)
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
                    comment: response.comment,
                });
            }
            return res.status(403).send({ errors: result.array() });
        }catch(error) {
            logger.error(`${error.stack}`);
            next({
                message: "INTERNAL_SERVER_ERROR",
                status: 500
            })
        }
    }
}

module.exports = {
    CommentController
}