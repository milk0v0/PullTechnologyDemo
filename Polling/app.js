const http = require('http');

let data = 0;
setInterval(() => {
    ++data
}, 800);

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
                        xhr.onload = () => (div.innerHTML = xhr.responseText);
                        xhr.open('get', '/upData', true);
                        xhr.send();
                    }
                    upData();
                    setInterval(upData, 1000);
                </script>
            </html>
        `)
    } else if (req.url === '/upData') {
        res.end(data + '');
    } else {
        res.end('404');
    }
});

server.listen(1000);