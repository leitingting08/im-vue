<template>
  <div class="chat">
    <div>
      <i class="iconfont icon-users" /> 
      {{total_count}} 人
    </div>
    <el-card class="box-card">
        <div v-for="{msg_type,receive_time,name} in messages" :key="msg_type">
            {{ receive_time }}  {{name}}进入聊天室
        </div>
    </el-card>
    <div class="global-flex">
      <el-input/><el-button type="primary">发送</el-button>
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
      this.$prompt('请输入昵称', '提示', {
         showClose: false,
         showCancelButton: false,
          confirmButtonText: '确定',
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: '名称格式不正确'
        }).then(({ value }) => {
          console.log(value)
          that.chatClient.send({
            msg_type: 1,
            send_time: timeNow,
            name: value
          })
        })
    },
    handleChat() { // 初始化链接
        this.chatClient.init('ws://localhost:8086')
        this.chatClient.on('message', (data) => {
        const { code, message, results } = data
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
.chat{
  .box-card{
    min-height: 500px;
  }
  .global-flex{
    display: flex;
  }
}
</style>
