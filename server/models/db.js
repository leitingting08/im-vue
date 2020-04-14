const mongoose = require('mongoose');
const DB_URL = 'mongodb://localhost:27017/chat';

/* 链接 */
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/* 链接成功 */
mongoose.connection.on('connected', function () {
  console.log('数据库连接成功： ' + DB_URL);
});

// 链接异常
mongoose.connection.on('error', function (err) {
  console.log('数据库连接失败：' + err);
});

// 链接断开
mongoose.connection.on('disconnected', function () {
  console.log('数据库连接断开');
});

module.exports = mongoose;