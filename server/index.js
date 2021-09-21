const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const color = require('colors');
var connected = 0;

io.on('connection', (socket) => {
    socket.on('join', function(callback){
        connected++;
        socket.stranger = ("000" + Math.floor(9999*Math.random())).slice(-4);
        callback({
            connected,
            stranger: socket.stranger
        });
        socket.broadcast.emit("join", {
            stranger: socket.stranger
        });
        console.log(`Stranger#${socket.stranger} joined`.green);
    });
    socket.on('chat_disconnect', function(stranger){
        connected--;
        socket.broadcast.emit('chat_disconnect', {
            stranger: socket.stranger
        });
        console.log(`Stranger#${socket.stranger} left`.red.bold);
    });
    socket.on('message', function(message){
        socket.broadcast.emit('message', {
            stranger: socket.stranger,
            message
        });
        console.log(`${"Stranger#".magenta+socket.stranger.magenta+":".magenta} ${message.cyan}`);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});