<template>
  <div class="chat">
    <div class="header">
      <i class="iconfont icon-users" />
      {{total_count}} 人
    </div>
    <div class="box-card" ref="chat">
      <div
        v-for="({msg_type,send_time,user_name,msg_content},index) in messages"
        :key="index"
        class="msg"
      >
        <div class="txtcenter" v-if="['ENTER','LEAVE'].includes(msg_type)">
          <span class="boardcast">{{ send_time }} <span class="name">{{user_name}}</span> {{msg_type==='ENTER'?'进入':'离开'}}直播间</span>
        </div>
        <div v-if="msg_type==='MESSAGE'" class="box-card-msg">
          <div :class="self===user_name?'txtright':'txtleft'">{{send_time}} <span class="colorange">@{{user_name}}</span></div>
          <div :class="self===user_name?'txtright':'txtleft'" class="content">
            <span class="message">{{ msg_content }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="flex">
        <el-input v-model.trim="inputMsg" @keyup.enter.native="sendMsg" />
        <el-button type="primary" @click="sendMsg">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import ChatClient from '@/utils/chatClient'
import dayjs from 'dayjs'
import axios from 'axios'

const timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss')
const ip = require('../utils/getIp')()
const port = 8086
const wsURL = `ws://${ip}:${port}`
const httpURL = `http://${ip}:${port}`
const historyMsgUrl = `${httpURL}/messages`
const userSaveUrl = `${httpURL}/saveusers`
export default {
  name: 'Chat',
  data() {
    return {
      chatClient: new ChatClient(),
      total_count: 1,
      messages: [],
      inputMsg:'',
      self: sessionStorage.getItem('USER_NAME')
    }
  },
  created() {
    this.chatClient.init(wsURL)
    this.getHistoryMsgs()
  },
  mounted() {
    this.open()
    this.handleChat()
  },
  methods: {
    sendMsg() {
      if(!this.inputMsg) return
       this.chatClient.send({
          msg_type: 'MESSAGE',
          send_time: timeNow,
          user_name: this.self,
          msg_content: this.inputMsg
        })
        this.inputMsg = ''
        this.scrollBottom(true)
    },
    scrollBottom (smooth = false) { // 滚动到底部
      setTimeout(() => {
        const msgWindow = this.$refs.chat
        if (typeof msgWindow.scroll === 'function') {
          msgWindow.scroll({
            top: msgWindow.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
          })
        } else {
          msgWindow.scrollTop = msgWindow.scrollHeight
        }
      }, 10)
    },
    async getHistoryMsgs(){
      const res = await axios.get(historyMsgUrl)
      this.messages = res.data.results
      this.total_count = res.data.onlineCount
    },
    open(){
      let that = this
      if(!this.self){
        this.$prompt('请输入昵称', '提示', {
         showClose: false,
         showCancelButton: false,
          confirmButtonText: '确定',
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: '名称格式不正确',
         beforeClose: async (action, instance, done)=>{
              const value = instance.inputValue
              if(value.length>10){
                that.$message({
                  message: '昵称不能超过10个字符',
                  type: 'error'
                })
                return
              }
              const res = await axios.post(userSaveUrl,{user_name: value})
              if(res.data.success){
                  that.chatClient.send({
                    msg_type: 'ENTER',
                    send_time: timeNow,
                    user_name: value
                  })
                this.self = value
                sessionStorage.setItem('USER_NAME',value)
                this.scrollBottom(true)
                done()
              }else{
                that.$message({
                  message: res.data.msg||'保存失败',
                  type: 'error'
                })
              }
          }
        })
      }
    },
    handleChat() { // 初始化链接
        this.chatClient.on('message', (data) => {
          if(data&&data.results){
            const { code, message, results,onlineCount } = data
            const { msg_type } = results
            if(msg_type!=='PING'){ // PING心跳 ENTER进入聊天室广播 MESSAGE消息收发
              this.messages.push(results)
              this.total_count = onlineCount?onlineCount: 0
              this.scrollBottom(true)
            }
          }
      })
    }
  },
}
</script>

<style lang="less" scoped>
@orange: #ff6e00;
@green: #00b9a3;
.colorange{color:@orange;}
.chat {
  width: 100%;
  height: 100%;
  position: relative;
  color: #333;
  font-size: 12px;
  background: #f5f5f5;
  overflow: hidden;
  .header{
    background: #fff;
    padding: 10px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }
  .box-card {
    padding: 50px 10px 40px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    &-msg {
      .content {
        padding: 20px 0;
        &.txtright {
        .message {
          background: @green;
          color: #fff;
        }
      }
      }
      .message {
        padding: 15px 10px;
        min-height: -webkit-fit-content;
        min-height: -moz-fit-content;
        min-height: fit-content;
        max-width: 400px;
        border-radius: 6px;
        background: #fff;
        word-break: break-word;
      }
      
    }
    .msg {
      padding-bottom: 15px;
      .txtleft {
        text-align: left;
      }
      .txtright {
        text-align: right;
      }
      .txtcenter {
        text-align: center;
      }
      .boardcast {
        border-radius: 2em;
        padding: 2px 10px;
        background: rgba(0, 0, 0, 0.1);
        .name{
          color: @orange;
        }
      }
    }
  }
  .footer{
    position: fixed;
    bottom: 0;
    left:0;
    background:#fff;
    width:100%;
    .flex {
      display: flex;
    }
  }
}
</style>
