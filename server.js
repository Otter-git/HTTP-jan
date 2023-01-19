const fs = require("fs");
const http = require("http");
const host = 'localhost';
const port = 8000;

const requestListener = (req, res) => {
    urls = ['/get', '/post', '/delete', '/redirect', '/redirected'];
    if (urls.includes(req.url)) {
        if (req.url === '/get') {
            if (req.method !== 'GET') {
                res.writeHead(405);
                res.end('HTTP method not allowed');
            } else {
                try {
                    files = fs.readdirSync('./files');
                    res.writeHead(200);
                    res.end(files.join(", "));
                } catch {
                    res.writeHead(500);
                    res.end("Internal server error");
                }
            }
        }
        if (req.url === '/post') {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end('HTTP method not allowed');
            } else {
                res.writeHead(200);
                res.end('Success!');
            }
        }
        if (req.url === '/delete') {
            if (req.method !== 'DELETE') {
                res.writeHead(405);
                res.end('HTTP method not allowed');
            } else {
                res.writeHead(200);
                res.end('Success!');
            }
        }
        if (req.url === '/redirect') {
            res.writeHead(301, ['Location', '/redirected']);
            res.end();
        }
        if (req.url === '/redirected') {
            res.writeHead(200);
            res.end('Success!');
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});