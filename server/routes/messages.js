const express = require('express');
const router = express.Router();
const Message = require('../models/message');


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
        results: ret
    });
    }
  })
  
});

module.exports = router;
