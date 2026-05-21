const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_PATH = '/iot-monitor-web';
const DIST_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  
  if (urlPath === '/' || urlPath === BASE_PATH || urlPath === BASE_PATH + '/') {
    urlPath = BASE_PATH + '/index.html';
  }
  
  let filePath;
  
  if (urlPath.startsWith(BASE_PATH)) {
    filePath = path.join(DIST_DIR, urlPath.replace(BASE_PATH, ''));
  } else {
    filePath = path.join(DIST_DIR, urlPath);
  }
  
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('File not found: ' + urlPath);
    return;
  }
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error: ' + err.message);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`服务器已启动`);
  console.log(`应用地址: http://localhost:${PORT}${BASE_PATH}/`);
  console.log(`诊断页面: http://localhost:${PORT}/diagnostic.html`);
  console.log(`按 Ctrl+C 停止服务器`);
  console.log(`========================================\n`);
});