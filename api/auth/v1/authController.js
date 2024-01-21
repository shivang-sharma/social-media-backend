const { Request, Response, NextFunction } = require("express");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { validationResult, matchedData } = require("express-validator");
const { AuthService } = require("./authService");
const logger = require("../../../logger")

class AuthController {
    static authService = new AuthService();
    static login(req, res, next) {
        passport.authenticate('local', {session: false}, (err, user, info) => {
            if (err || !user) {
                logger.error(err);
                return res.status(400).json({
                    message: info ? info.message : 'Login failed',
                    user   : user
                });
            }
    
            req.login(user, {session: false}, (err) => {
                if (err) {
                    logger.error(err);
                    res.send(err);
                }
    
                const token = jwt.sign(user, 'your_jwt_secret', {
                    // expiresIn is expressed in seconds
                    expiresIn: 60*1000
                });
    
                return res.status(200).json({user, token});
            });
        })(req, res, next);
    }
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     * @returns

     */
    static async register(req, res, next) {
        try {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const body = matchedData(req);
                const firstname = body.firstname;
                const lastname = body.lastname;
                const username = body.username;
                const email = body.email;
                const password = body.password;
                const user = await AuthController.authService.register(firstname, lastname, username, email, password);
                return res.status(200).json(JSON.stringify(user));
            }
            return res.status(403).send({ errors: result.array() });
        } catch (error) {
            logger.error(`${error.stack}`);
            return res.status(500).json("INTERNAL_SERVER_ERROR");
        }
    }
}
module.exports = {
    AuthController
}