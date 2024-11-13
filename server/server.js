const http = require('http');
const mysql = require('mysql2');
const url = require('url');
const querystring = require('querystring');

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

    // 处理产品信息请求
    if (req.method === 'GET' && req.url.startsWith('/product/')) {
        const productId = Number(req.url.split('/')[2]);

        db.execute('SELECT * FROM featured_products WHERE product_id = ?', [productId], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                return;
            }
            if (results.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '产品不存在' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results[0]));
        });
    }
    // 处理用户注册请求
    else if (req.method === 'POST' && req.url === '/signup') {
        let body = '';
    
        req.on('data', chunk => {
            body += chunk.toString(); // 将获取到的数据转化为字符串
        });
    
        req.on('end', () => {
            const { username, email, password } = querystring.parse(body);
    
            // 这里可以插入数据库逻辑
            db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                [username, email, password], (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                        return;
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: '注册成功' }));
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

