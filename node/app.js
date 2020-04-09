const dayjs = require('dayjs')
const WebSocket = require('ws');
const redis = require('redis');
const redisClient = redis.createClient(); //默认连接localhost:6379，具体配置参数可以参考文档https://github.com/NodeRedis/node_redis
const cb = (err, data) => {
  console.log('err: ', err, ' data: ', data, ' data type: ', typeof data);
}
const server = new WebSocket.Server({
  port: 8086
});
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

const timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss')

server.on('connection', function connection(ws) {
  console.log(`[SERVER] connection()`);
  ws.on('message', function incoming(msg) {
    const {
      msg_type,
      name
    } = JSON.parse(msg)

    // redisClient.set('msg', 20, cb);  
    // redisClient.get('msg', cb); 

    // 广播消息给所有客户端
    server.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        let results = null
        switch (msg_type) {
          case 1: // 1用户进入
            //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
            ws.name = name;
            //检查在线列表，如果不在里面就加入
            if (!onlineUsers.hasOwnProperty(name)) {
              onlineUsers[name] = name;
              //在线人数+1
              onlineCount++;
            }
            results = {
              msg_type,
              receive_time: timeNow,
              name,
              online_count: onlineCount
            }
            break
        }
        if (results) {
          client.send(JSON.stringify({
            code: 0,
            message: '接收成功',
            results
          }));
          redisClient.rpush('messages', JSON.stringify(results), cb); //err:  null  data:  2  data type:  number
          redisClient.lrange('messages', 0, -1, cb);
        }
      }
    });
  });
  ws.send('something');
});