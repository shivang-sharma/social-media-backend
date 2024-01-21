const cors = require('cors');
const logger = require('../logger')

const whiteList = new Set(["http://localhost:5000"]);
const corsOptions = {
    optionsSuccessStatus: 200, // Some leagacy browser choke on 204
    origin: function (origin, callback) {
        logger.debug(origin);
        if (!origin || whiteList.has(origin)) {
            callback(null, true);
        } else {
            logger.error(origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}
const corsMiddleware = cors(corsOptions);
module.exports = corsMiddleware;