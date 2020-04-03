const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname)));

app.get('/', function (req, res) {
    res.sendFile('public/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('get barrage from user', function (message) {
        console.log('get barrage from user', message);
        socket.broadcast.emit('get barrage from server', message);
    });
});

http.listen(6666, function () {
    console.log('listening on localhost:6666');
});