const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ejs = require('ejs');

const index = require('./routes/index');
const users = require('./routes/users');
const messages = require('./routes/messages');

const app = express();
//allow custom header and CORS
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.sendStatus(200); // 让options请求快速返回
  }
  else {
    next();
  }
}); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/saveusers', users);
app.use('/messages', messages);
/**
 * 默认连接localhost:6379，具体配置参数可以参考文档https://github.com/NodeRedis/node_redis
 **/
const redis = require('redis');
const redisClient = redis.createClient();
app.use((req, res, next) =>{
    const ua = req.headers['user-agent'];
    redisClient.zadd('online', Date.now(), ua, next);
})
app.use((req, res, next) =>{
  const min = 60 * 1000;
    const ago = Date.now() - min;
    redisClient.zrevrangebyscore('online', '+inf', ago,  (err, users) =>{
      if (err) return next(err);
      req.online = users;
      next();
    });
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;