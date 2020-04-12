const express = require('express');
const router = express.Router();
const Message = require('../models/message');

/* GET 历史消息 */
router.get('/', function(req, res, next) {
  console.log(Message.find())
  res.json({
        success: true,
        msg:'查询成功',
        results: [{user_name:"ltt",msg_type:2,send_time:'2020-09-09 11:00:00'}]
    });
});

module.exports = router;
