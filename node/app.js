const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8086 });

server.on('connection', function connection(ws) {
    console.log(`[SERVER] connection()`);
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
      // 广播消息给所有客户端
      server.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send( clientName + " -> " + message);
        }
      });
    });
    ws.send('something');
  });
  