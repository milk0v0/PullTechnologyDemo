const fs = require('fs');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const app = new Koa();
const router = new KoaRouter();

router.get('/', ctx => {
    ctx.set('Content-Type', 'text/html;chart=utf-8')
    ctx.body = fs.readFileSync('./views/view.html');
});

app.use(router.routes());

const server = require('http').createServer(app.callback());

const io = require('socket.io')(server);

io.on('connection', socket => {
    socket.emit('hello', '欢迎来到聊天室');

    socket.broadcast.emit('hello', `${socket.id} - 加入聊天室`);

    socket.on('speak', data =>{
        socket.broadcast.emit('speak', `${socket.id}说：${data}`);
    });
});

server.listen(8080); 