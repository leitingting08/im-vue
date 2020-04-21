const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const redisClient = require('../models/redis')

let onlineCount = 0
redisClient.lrange("names", 0, -1, function(err, applies) { // 从redis读取
  // 获取redis存的数组的长度，即在线人数
  onlineCount = applies.length
});

/* GET 历史消息 */
router.get('/', (req, res, next)=> {
  Message.find((err,ret)=>{
    if(err){
     res.json({
      success: false,
      msg:'查询失败',
      results: []
  });
    } else {
      res.json({
        success: true,
        msg:'查询成功',
        onlineCount,
        results: ret
    });
    }
  })
  
});

module.exports = router;
