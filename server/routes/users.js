const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user');

/* GET 存储用户信息 */
router.post("/", function (req, res, next) {
  const params = req.body
  console.log(params)
  if(User.find({params})){
    res.json({
        success: false,
        msg:'保存失败，昵称已存在',
        results: []
    });
  }else{
    res.json({
        success: true,
        msg:'保存成功',
        results: params
    });
  }
  
});

module.exports = router;
