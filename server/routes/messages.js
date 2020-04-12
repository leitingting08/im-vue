const express = require('express');
const router = express.Router();

/* GET 历史消息 */
router.get('/', function(req, res, next) {
  console.log(req, res, next)
});

module.exports = router;
