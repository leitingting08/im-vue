<template>
  <div class="chat">
    <div>
      <i class="iconfont icon-users" />
      {{total_count}} 人
    </div>
    <el-card class="box-card">
      <div
        v-for="({msg_type,send_time,user_name,msg_content},index) in messages"
        :key="index"
        class="msg"
      >
        <div class="txtcenter" v-if="msg_type===2">
          <span class="boardcast">{{ send_time }} {{user_name}}进入聊天室</span>
        </div>
        <div v-if="msg_type===3" class="box-card-msg">
          <div :class="self===user_name?'txtright':'txtleft'">{{send_time}} <span class="colorange">@{{user_name}}</span></div>
          <div :class="self===user_name?'txtright':'txtleft'" class="content">
            <span class="message">{{ msg_content }}</span>
          </div>
        </div>
      </div>
    </el-card>
    <div class="footer">
      <div class="flex">
        <el-input v-model="inputMsg" @keyup.enter.native="sendMsg" />
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
const NAME = sessionStorage.getItem('USER_NAME')
export default {
  name: 'Chat',
  data() {
    return {
      chatClient: new ChatClient(),
      total_count: 0,
      messages: [],
      inputMsg:'',
      self: NAME
    }
  },
  created() {
    this.chatClient.init('ws://localhost:8086')
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
          msg_type: 3,
          send_time: timeNow,
          user_name: NAME,
          msg_content: this.inputMsg
        })
        const t =document.body.clientHeight;
        window.scroll({top:t+100,left:0,behavior:'smooth' });
    },
    async getHistoryMsgs(){
      const res = await axios.get('http://localhost:8086/messages')
      this.messages = res.data.results
    },
    open(){
      let that = this
      if(!NAME){
        this.$prompt('请输入昵称', '提示', {
         showClose: false,
         showCancelButton: false,
          confirmButtonText: '确定',
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: '名称格式不正确',
         beforeClose: async (action, instance, done)=>{
              const value = instance.inputValue
              const res = await axios.post('http://localhost:8086/saveusers',{user_name: value})
              if(res.data.success){
                  that.chatClient.send({
                    msg_type: 2,
                    send_time: timeNow,
                    user_name: value
                  })
                sessionStorage.setItem('USER_NAME',value)
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
            const { code, message, results } = data
            const { online_count, msg_type } = results
            this.total_count = online_count?online_count: 0
            switch(msg_type){
              case 2: // 1心跳 2 进入聊天室广播 3消息收发
                this.messages.push(results)
                break
              case 3: // 1 进入聊天室广播
                this.messages.push(results)
                break
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
  position: relative;
  color: #333;
  font-size: 12px;
  padding-bottom: 80px;
  .box-card {
    min-height: 500px;
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
        background: #f7f8fa;
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
      }
    }
  }
  .footer{
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 100px;
    background:#fff;
    .flex {
      display: flex;
    }
  }
}
</style>
