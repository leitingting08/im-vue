<template>
  <div class="chat">
    <div>
      <i class="iconfont icon-users" />
      {{total_count}} 人
    </div>
    <el-card class="box-card">
      <div v-for="{msg_type,send_time,user_name} in messages" :key="msg_type" class="msg">
        <div class="txtcenter">
          <span class="boardcast">{{ send_time }}  {{user_name}}进入聊天室</span>
        </div>
      </div>
    </el-card>
    <div class="global-flex">
      <el-input />
      <el-button type="primary">发送</el-button>
    </div>
  </div>
</template>

<script>
import ChatClient from '@/utils/chatClient'
import dayjs from 'dayjs'
const timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss')
export default {
  name: 'Chat',
  data() {
    return {
      chatClient: new ChatClient(),
      total_count: 0,
      messages: []
    }
  },
  mounted() {
    this.open()
    this.handleChat()
  },
  methods: {
    open(){
      let that = this
      const NAME = sessionStorage.getItem('USER_NAME')
      if(!NAME){
         this.$prompt('请输入昵称', '提示', {
         showClose: false,
         showCancelButton: false,
          confirmButtonText: '确定',
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: '名称格式不正确'
        }).then(({ value }) => {
          that.chatClient.send({
            msg_type: 1,
            send_time: timeNow,
            user_name: value
          })
          sessionStorage.setItem('USER_NAME',value)
        })
      }
    },
    handleChat() { // 初始化链接
        this.chatClient.init('ws://localhost:8086')
        this.chatClient.on('message', (data) => {
        const { code, message, results } = data
        console.log(results)
         this.total_count = results.online_count
         switch(results.msg_type){
           case 1: // 1 进入聊天室广播
            this.messages.push(results)
             break
         }
      })
    }
  },
}
</script>

<style lang="less" scoped>
.chat {
  color: #333;
  font-size: 12px;
  .box-card {
    min-height: 500px;
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
  .global-flex {
    display: flex;
  }
}
</style>
