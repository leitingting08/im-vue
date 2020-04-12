const dayjs = require('dayjs')
const redis = require('redis');
const redisClient = redis.createClient(); //默认连接localhost:6379，具体配置参数可以参考文档https://github.com/NodeRedis/node_redis
const dbOp = require('./utils/dbOp')
const User = require('./models/user');
const Message = require('./models/message');
const app = require('./app');
const WebSocket = require('ws');
const server = require('http').createServer(app);
const wss = new WebSocket.Server({server});

module.exports = {
   onConnection: (ws) => {
     let results = null
     let onlineCount = 0
     let onlineUsers = {}
     const timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss')

      ws.on('message', (msg)=> {
            const {
              msg_type,
              user_name
            } = JSON.parse(msg)

          switch (msg_type) {
            case 1: // 1用户进入
              //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
              ws.user_name = user_name;
              //检查在线列表，如果不在里面就加入
              if (!onlineUsers.hasOwnProperty(user_name)) {
                onlineUsers[user_name] = user_name;
                //在线人数+1
                onlineCount++;
              }
              results = {
                msg_type,
                send_time: timeNow,
                user_name,
                online_count: onlineCount
              }
              redisClient.rpush('messages', JSON.stringify(results), dbOp.cb); // 存redis
              redisClient.lrange('messages', 0, -1, dbOp.cb);
              var user = new User({
                user_name
              })
              dbOp.save(user)
              var message = new Message(results)
              dbOp.save(message)
              break
          }

          wss.clients.forEach((client)=> { // 广播消息给所有客户端
              if (client.readyState === WebSocket.OPEN) {
                if (results) {
                  client.send(JSON.stringify({
                    code: 0,
                    message: '接收成功',
                    results
                  }))
                }
              }
          })
      })
   }
}
