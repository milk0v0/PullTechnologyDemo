## 前言

+ 我们一般请求，都是由客户端向服务端发出请求，再由服务端再返回数据回来，他缺少一个实时性
+ 假设我们现在有一个需求，当服务器某些数据发生改变时，主动向客户端推送数据，这个时候我们该怎么处理呢？
+ 每一块我都写了相应的示例，大家可以看看
+ 建议每个都看一下 浏览器`Network` 便于观察
+ 下面我们就来慢慢的了解 推送技术



## HTTP协议

+ 我们先了解我们一般用到的 - HTTP
+ HTTP 是一个超文本数据传输协议，它主要是用来定义数据是如何进行传输的，以及数据包的格式
+ 其在设计之初使用的是单一模式/临时模式（完成响应请求之后就断开连接了，不会再实时推送，需要再次请求）
+ 实际来点说，服务端返回一个页面，客户端就看页面了，我们也不希望看着看着页面的时候，突然弹出点莫名其妙的东西或者是看着的文字突然发生改变
+ **请求/响应 模式**
  + 首先必须由客户端发送请求，服务器再对该请求进行响应
    + 客户端 => 服务端（请求）
    + 服务端 => 客户端（响应）
  + 问题：服务端不能及时推送数据到客户端
+ **无状态 模式**
  + HTTP 不保存（不持久化、不记忆）每次请求的客户端
  + 问题：服务端无法得知当前客户端请求的内容是否已经处理过或是否已经验证过身份等
+ 目的是为了**减少服务器开销**



## 实时传输需求 以及 应对HTTP协议的单一性

+ 随着上网的人越来越多，不同的需求也相继涌现了出来，这个时候，我们希望对传输的实时性有一定的要求，但是 HTTP 协议已经定下了，这个时候怎么办？



### 轮询

+ 这个操作很简单，就是不断的按住你的刷新，我们就可以手动的完成轮询
+ 实现上来说：客户端定时不断向服务器发送Ajax请求，服务器接到请求后无论是否有响应的数据，都马上返回响应信息并关闭连接
+ **优点**：实现非常简单
+ **缺点**：浪费带宽和服务器资源，新数据响应会有延迟
+ **应用场景**：一些小应用的小场景
+ [demo](https://github.com/milk0v0/PullTechnologyDemo/tree/master/Polling) - `node app.js`



### 长轮询

+ 与简单轮询相似，只是在服务端在没有新的返回数据情况下不会立即响应，而会挂起，直到有数据或即将超时
+ **优点**：实现也不复杂，同时相对轮询，节约带宽
+ **缺点**：还是存在占用服务端资源的问题，虽然及时性比轮询要高，但是会在没有数据的时候在服务端挂起，所以会一直占用服务端资源，处理能力变少
+ **应用**：一些早期的对及时性有一些要求的应用：web IM 聊天
+ [demo](https://github.com/milk0v0/PullTechnologyDemo/tree/master/LongPolling) - `node app.js`
+ demo 内一直重复判断 oldData 与 data 只是一个模拟，实际应用中肯定有触发条件，例如：聊天，别人发了新的消息等



## SSE（Server Send Event）服务器推送

+ 一个客户端获取新的数据通常需要发送一个请求到服务器，也就是向服务器请求的数据。使用 server-sent 事件，服务器可以在任何时刻向我们的客户端推送数据和信息。这些被推送进来的信息可以在这个客户端上作为 Events + data 的形式来处理
+ 他是一种基于 WebSocket 协议的一种服务器向客户端发送事件和数据的单向通讯
+ HTML5 服务器发送事件（server-sent event）允许网页获得来自服务器的更新
+ **特点**：单向通讯 - 客户端与服务器发送请求连接后，服务端可以随时向客户端发送事件和数据



### 客户端

+ 使用 **[EventSource](https://developer.mozilla.org/zh-CN/docs/Server-sent_events/EventSource) 类**接口来完成请求

```javascript
// /upData 为获取数据的URL
const source = new EventSource("/upData");

// listen 'ping'（事件由服务端定义），服务端推送时接收事件
source.addEventListener('ping', e => {
    div.innerHTML = e.data;
});

// 关闭连接
setTimeout('source.close()', 10000);
```



### 服务端

+ 服务端需要做规定设置

**头信息**

```javascript
res.setHeader('Content-Type', 'text/event-stream');
```

**返回数据格式**

```javascript
// event为客户端接收事件，data为客户端接收数据
res.write(`event: ping\ndata: {a: ${data}}\n\n`);

// 客户端断开连接时
req.connection.addListener('close', () => { });
```



### 参考API 及 示例

+ **[EventSource](https://developer.mozilla.org/zh-CN/docs/Server-sent_events/EventSource)**
+ **[Server-sent events](https://developer.mozilla.org/zh-CN/docs/Server-sent_events)**
+ **[demo](https://github.com/milk0v0/PullTechnologyDemo/tree/master/SSE)** - `node app.js`



## WebSocket

+ WebSocket 是 HTML5 开始提供的一种在单个连接上进行全双工通讯的协议
+ WebSocket使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据
+ 客户端与服务端只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输
+ 握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器
+ 我主要使用 **WebSocket 库** - **[socket.io](https://socket.io/)**
+ 下面简单说一下基本使用，api也多，有需求还是查一查呗~



### 安装

```sh
npm install socket.io
```



### 服务端

#### 原生

```javascript
// server 为 http.createServer，还有第二参数 options 选填，用于配置 socket
const io = require('socket.io')(server);
```

#### koa

+ 与原生类似，不过 socket.io 库第一个参数需要 原始http对象，所以这里处理一下
+ 相当于把 koa 封装好的方法传入原生的 http 对象

```javascript
const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, { });
```

+ 服务端连接

```javascript
io.on('connection', socket => { } // 客户端连接后响应
```



### 客户端

+ `io()` 内参数可为配置项，用于与服务端信息配对

```html
<!-- 这个链接会直接打在服务端上，相当于一次握手请求 -->
<script src="/socket.io/socket.io.js"></script>
```

```javascript
const socket = io('/'); // 请求连接升级为 websocket 协议 - 连接
```



### 发送与接收

+ 客户端与服务端方法一致，都是使用 `emit` 发送消息，`on` 接收消息

```javascript
socket.emit('hello', '欢迎');

socket.on('hello', data => {
    console.log(data)
});
```

+ 服务端广播 - 发送给其他人

```javascript
socket.broadcast.emit('hello', '大家欢迎');
```



### 参考API 及 示例

+ **[socket.io](https://socket.io/)**
+ **[简单聊天室demo](https://github.com/milk0v0/PullTechnologyDemo/tree/master/websocket)** - 原生：`node app1.js`；koa：`node app2.js`

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/caa41ffca71c4cb09431f6d4758dda78~tplv-k3u1fbpfcp-watermark.image" width=500/>

