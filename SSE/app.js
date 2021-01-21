const http = require('http');

let data = 0;
setInterval(() => {
    ++data
}, 2000);

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
                    const source = new EventSource('/upData');
                    source.addEventListener('ping', e => {
                        div.innerHTML = e.data;
                    });
                    setTimeout('source.close()', 10000);
                </script>
            </html>
        `)
    } else if (req.url === '/upData') {
        res.setHeader('Content-Type', 'text/event-stream');
        const interval = setInterval(() => {
            res.write(`event: ping\ndata: ${data}\n\n`);
        }, 500);
        req.connection.addListener('close', () => {
            clearInterval(interval);
            res.end();
        });
    } else {
        res.end('404');
    }
});

server.listen(3000);