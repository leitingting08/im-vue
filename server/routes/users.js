const express = require('express');
const router = express.Router();
const User = require('../models/user');
const dbOp = require('../utils/dbOp')

/* GET 存储用户信息 */
router.post("/",  (req, res, next)=> {
  const params = req.body
  User.find(params, (err,ret)=>{
    if(err){
      res.json({
          success: false,
          msg:'保存失败',
          results: []
      });
    }else{
      if(ret.length){
        res.json({
            success: false,
            msg:'保存失败，昵称已存在',
            results: []
        });
      }else{
        var user = new User(ret)
        dbOp.save(user)
        res.json({
          success: true,
          msg:'保存成功',
          results: []
      });
      }
      
    }
  })
});

module.exports = router;
