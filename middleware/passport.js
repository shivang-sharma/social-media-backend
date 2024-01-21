const passport = require('passport');
const passportLocal = require("passport-local");
const passportJWT = require("passport-jwt");
const bcrypt = require("bcrypt")
const { User } = require("../db");
const logger = require('../logger');

const LocalStrategy = passportLocal.Strategy;

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (email, password, cb) {

        //Assume there is a DB module pproviding a global UserModel
        return User.findOne({ email })
            .then(user => {
                if (!user) {
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }
                bcrypt.compare(password, user.passwordHash)
                    .then(status => {
                        if (status === true) {
                            return cb(null, {
                                id:user._id,
                                email:user.email,
                                username:user.username,
                                name: `${user.name.first} ${user.name.last}`
                            }, {
                                message: 'Logged In Successfully'
                            });
                        }
                        return cb(null, false, { message: 'Incorrect email or password.' });
                    }).catch(err => {
                        return cb(err);
                    })
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
    function (jwtPayload, cb) {
        return cb(null, jwtPayload);
    }
));