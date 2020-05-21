# im-vue 前端

## 安装项目依赖
```
npm install
```

### 运行项目
```
npm run serve
```

### 打包
```
npm run build
```

### 规范文件
```
npm run lint
```

### 实现功能

#### 群聊

- [x] 正常群聊，保存消息记录到数据库
- [x] 用户进入离开以及发送消息都有广播提示
- [x] 消息发送失败的重试机制

#### 弹幕

- [x] Canvas 绘制普通弹幕播放
- [ ] 视频全屏也可播放弹幕，层级问题如何解决？全屏的时候视频层级高
- [ ] 按视频弹幕发送时间顺序存Redis，MongoDB
- [ ] 暂定视频播放的时候要暂定弹幕，点击继续播放的时候继续
- [ ] 高级弹幕怎么做，如何存？

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
