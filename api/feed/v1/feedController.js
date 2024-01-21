const { Request, Response, NextFunction } = require("express");
const { FeedService } = require("./feedService")
const logger = require("../../../logger")

class FeedController {
    static feedService = new FeedService()
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     * @returns 
     */
    static async get(req, res, next) {
        try {
            const feed = await FeedController.feedService.get();
            return res.status(200).json(feed);
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
    FeedController
}