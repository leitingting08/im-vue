var express = require('express');
var app = express();
var router = express.Router();

/* GET 存储用户信息 */
router.post("/", function (req, res, next) {
  console.log(req, res, next)
});

module.exports = router;
