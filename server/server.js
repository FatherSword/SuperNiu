const http = require('http');
const mysql = require('mysql2');
const url = require('url');
const querystring = require('querystring');
const bcrypt = require('bcrypt'); // 引入 bcrypt

const PORT = 3000;

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


