const http = require('http');

let data = 0;
setInterval(() => {
    ++data
}, 2000);
let oldData = '';

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html;charset=utf-8');
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body>
                    <div id="div"></div>
                </body>
                <script>
                    const div = document.querySelector('div');
                    function upData() {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = () => {
                            div.innerHTML = xhr.responseText;
                            setTimeout(upData, 1000);
                        };
                        xhr.open('get', '/upData', true);
                        xhr.send();
                    }
                    upData();
                </script>
            </html>
        `)
    } else if (req.url === '/upData') {
        upData(res);
    } else {
        res.end('404');
    }
});

function upData(res) {
    // 模拟服务器数据改变时响应
    if(oldData === data) {
        setTimeout(upData, 100, res);
    } else {
        res.end(data + '');
        oldData = data;
    }
}

server.listen(2000);