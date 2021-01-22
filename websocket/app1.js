const fs = require('fs');

const server = require('http').createServer((req, res) => {
    if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html;chart=utf-8');
        res.end(fs.readFileSync('./views/view.html'))
    }
});

const io = require('socket.io')(server);

io.on('connection', socket => {
    socket.emit('hello', '欢迎来到聊天室');

    socket.broadcast.emit('hello', `${socket.id} - 加入聊天室`);

    socket.on('speak', data =>{
        socket.broadcast.emit('speak', `${socket.id}说：${data}`);
    });
});


server.listen(8080);