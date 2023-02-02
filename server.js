const fs = require("fs");
const http = require("http");
const host = 'localhost';
const port = 8000;

const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
};

function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}

function checkAuth(req) {
    let cookies = parseCookies(req);
    return 'userId' in cookies && 'authorized' in cookies
        && cookies.authorized == 'true' && cookies.userId == '123'
}

const requestListener = (req, res) => {
    urls = ['/get', '/post', '/delete', '/redirect', '/redirected', '/auth'];
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
        if (req.url === '/auth') {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end('HTTP method not allowed');
            } else {
                const body = [];
                let result;
                req.on('data', chunk => body.push(chunk.toString()))
                    .on('end', () => {
                        result = body.join();
                        try {
                            var loginRequest = JSON.parse(result);
                        } catch {
                            res.writeHead(400, 'Wrong username or password')
                            res.end();
                        }
                        if ('username' in loginRequest &&
                            'password' in loginRequest &&
                            user.username == loginRequest.username &&
                            user.password == loginRequest.password) {
                            res.writeHead(201, ['Set-Cookie',
                                'userId=' + user.id + ';Max-Age=172800;path=/',
                                'Set-Cookie', 'authorized=true;Max-Age=172800;path=/'])
                            res.end()

                        } else {
                            res.writeHead(400, 'Wrong username or password')
                            res.end()
                        }
                    })
            }
        }
        if (req.url === '/post') {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end('HTTP method not allowed');
            } else {
                if (checkAuth(req)) {
                    const body = [];
                    let result;
                    req.on('data', chunk => body.push(chunk.toString()))
                        .on('end', () => {
                            result = body.join();
                            try {
                                var fileRequest = JSON.parse(result);
                            } catch {
                                res.writeHead(400, 'Wrong params')
                                res.end();
                            }
                            if ('filename' in fileRequest &&
                                'content' in fileRequest) {
                                fs.writeFileSync('files/' + fileRequest.filename,
                                    fileRequest.content);
                            }
                        })
                    res.writeHead(200);
                    res.end('Success!');
                } else {
                    res.writeHead(400);
                    res.end('Error!');
                }
            }
        }
        if (req.url === '/delete') {
            if (req.method !== 'DELETE') {
                res.writeHead(405);
                res.end('HTTP method not allowed');
            } else {
                if (checkAuth(req)) {
                    const body = [];
                    let result;
                    req.on('data', chunk => body.push(chunk.toString()))
                        .on('end', () => {
                            result = body.join();
                            try {
                                var fileRequest = JSON.parse(result);
                            } catch {
                                res.writeHead(400, 'Wrong params')
                                res.end();
                            }
                            if ('filename' in fileRequest) {
                                try {
                                    fs.unlinkSync('files/' + fileRequest.filename)
                                    res.writeHead(200);
                                    res.end('Success!');
                                } catch {
                                    res.writeHead(404);
                                    res.end('Not found')
                                }
                            }
                        })
                } else {
                    res.writeHead(400);
                    res.end('Error')
                }
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