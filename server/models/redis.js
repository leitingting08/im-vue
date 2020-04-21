const redis = require("redis"); 
let redisClient = redis.createClient(); // 创建 redis 客户端

module.exports = redisClient