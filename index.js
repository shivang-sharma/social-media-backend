const http = require("http");
const { Server } = require('socket.io');
const passport = require("passport")
const { app } = require("./app");
const EventManager = require("./EventManager");
const logger = require('./logger')

require('./middleware/passport');

const port = 5000;
const server = http.createServer(app);
const io = new Server(server);

const eventManager = new EventManager().getInstance();
const wrapMiddlewareForSocketIo = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrapMiddlewareForSocketIo(passport.initialize()))
io.use(wrapMiddlewareForSocketIo(passport.authenticate('jwt', { session: false })))

eventManager.on('SEND_UPDATE', (update) => {
    io.emit(update.event, update.message);
})

io.on('connection', (socket) => {
    logger.debug("Client connected")
    socket.on('message', (message)=>{
        logger.debug(`Recieved : ${message}`);
        socket.emit('message', 'server response');
    })
    io.emit("message", "Test message")
})
io.on('disconnect', () => {
    logger.debug("Client disconnected")
})

server.listen(port, () => {
    logger.info(`REST Server listening on port ${port}`);
})