const http = require('http');
const mysql = require('mysql2');
const url = require('url');
const querystring = require('querystring');
const bcrypt = require('bcrypt'); // 引入 bcrypt
const fs = require('fs'); // 引入 fs 模块
const path = require('path'); // 引入 path 模块

const PORT = 3001; // 修改为3001端口以符合要求

// 创建数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // 替换为你的数据库用户名
    password: 'Cbzcbzcbz008625@', // 替换为你的数据库密码
    database: 'meters' // 替换为你的数据库名
});

// 连接数据库
db.connect(err => {
    if (err) {
        console.error('数据库连接失败: ' + err.stack);
        return;
    }
    console.log('数据库连接成功');
});

// 创建服务器
const server = http.createServer((req, res) => {
    // 设置 CORS 头部
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有源进行请求
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 允许的请求方法
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允许的请求头

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // No Content
        res.end();
        return;
    }

    // 处理静态文件请求
    if (req.method === 'GET') {
        let filePath = '.' + req.url; // 默认就是请求的路径
        if (filePath === './') {
            filePath = '../public/index.html'; // 默认返回 index.html
        } else if (filePath === '/contact.html') {
            filePath = '../public/contact.html';
        } else if (filePath === '/signup.html') {
            filePath = '../public/signup.html';
        }

        // 获取文件的扩展名
        const extname = String(path.extname(filePath)).toLowerCase();
        let contentType = 'text/html'; // 默认为 HTML

        // 根据文件类型设置 Content-Type
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
            case '.mp4':
                contentType = 'video/mp4';
                break;
            case '.woff':
            case '.woff2':
                contentType = 'application/font-woff';
                break;
            case '.ttf':
                contentType = 'application/font-sfnt';
                break;
        }

        // 读取文件并发送响应
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end('Sorry, there was an error: ' + error.code + '..\n');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // 处理用户注册请求
    else if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString(); // 将获取到的数据转化为字符串
        });
    
        req.on('end', () => {
            const { username, email, password } = querystring.parse(body);
    
            // 检查参数有效性
            if (!username || !email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: '所有字段都是必填的' }));
            }

            // 对密码进行哈希处理
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: '密码加密失败' }));
                }

                // 插入用户信息到数据库
                db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                    [username, email, hash], (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: err.message }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: '注册成功' }));
                    });
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('未找到该请求');
    }
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器在 http://localhost:${PORT} 启动`);
});



