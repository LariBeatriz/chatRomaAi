const wbs = require('ws')
const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
  fs.readFile("./websocket/chat-websocket.html", (err, file) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error loading ./websocket/chat-websocket.html");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(file);
    }
  });
});

const ws = new wbs.Server({ server });

ws.on('connection', (skt) => {
  skt.on('message', (msg) => {
    console.log(msg.toString('utf-8'))
    ws.clients.forEach((client) => {
        client.send(msg);
    })
  })
})

server.listen(3000)
