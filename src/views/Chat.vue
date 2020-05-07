<template>
  <div class="chat">
    <div class="header">
      <i class="iconfont icon-users" />
      {{ total_count }} 人
    </div>
    <div class="box-card" ref="chat">
      <div
        v-for="({ msg_type, send_time, user_name, msg_content, msg_id },
        index) in messages"
        :key="index"
      >
        <Message
          ref="messages"
          :id="msg_id"
          :msg_type="msg_type"
          :send_time="send_time"
          :user_name="user_name"
          :msg_content="msg_content"
          :self="self === user_name"
        />
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
import ChatClient from "@/utils/chatClient"
import dayjs from "dayjs"
import axios from "axios"
import Message from "@/components/Message"

var timestamp = (new Date()).valueOf()
const timeNow = dayjs().format("YYYY-MM-DD HH:mm:ss")
const ip =
  process.env.NODE_ENV === "development" ? "127.0.0.1" : "49.235.157.201"
const port = 8086
const wsURL = `ws://${ip}:${port}`
const httpURL = `http://${ip}:${port}`
const historyMsgUrl = `${httpURL}/messages`
const userSaveUrl = `${httpURL}/saveusers`
export default {
  name: "Chat",
  components: { Message },
  data() {
    return {
      chatClient: new ChatClient(),
      total_count: 1,
      messages: [],
      sendingMsgs: {}, // 待发送队列
      inputMsg: "",
      self: sessionStorage.getItem("USER_NAME")
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
    async sendMsg() {
      if (!this.inputMsg) return
      const results = {
        msg_type: "MESSAGE",
        send_time: timeNow,
        user_name: this.self,
        msg_content: this.inputMsg,
        msg_id: timestamp
      }
      this.sendingMsgs[timestamp] = this.inputMsg // 发送消息先进入待发送队列 收到反馈消息后移除
      this.chatClient.send(results)
      if(this.self) this.messages.push(results)
      await this.$nextTick()
      this.$refs.messages[this.messages.length-1].sending = true
      this.inputMsg = ""
      this.scrollBottom(true)
    },
    scrollBottom(smooth = false) {
      // 滚动到底部
      setTimeout(() => {
        const msgWindow = this.$refs.chat
        if (typeof msgWindow.scroll === "function") {
          msgWindow.scroll({
            top: msgWindow.scrollHeight,
            behavior: smooth ? "smooth" : "auto"
          })
        } else {
          msgWindow.scrollTop = msgWindow.scrollHeight
        }
      }, 10)
    },
    async getHistoryMsgs() {
      const res = await axios.get(historyMsgUrl)
      this.messages = res.data.results
      this.total_count = res.data.onlineCount
      this.scrollBottom(true)
    },
    open() {
      let that = this
      if (!this.self) {
        // 首次进入页面
        this.$prompt("请输入昵称", "提示", {
          showClose: false,
          showCancelButton: false,
          confirmButtonText: "确定",
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: "名称格式不正确",
          beforeClose: async (action, instance, done) => {
            const value = instance.inputValue
            if (value.length > 10) {
              that.$message({
                message: "昵称不能超过10个字符",
                type: "error"
              })
              return
            }
            const res = await axios.post(userSaveUrl, { user_name: value })
            if (res.data.success) {
              that.chatClient.send({
                msg_type: "ENTER",
                send_time: timeNow,
                user_name: value
              })
              this.self = value
              sessionStorage.setItem("USER_NAME", value)
              this.scrollBottom(true)
              done()
            } else {
              that.$message({
                message: res.data.msg || "保存失败",
                type: "error"
              })
            }
          }
        })
      }
    },
    handleChat() {
      // 初始化链接
      this.chatClient.on("message", (data) => {
        if (data && data.results) {
          const { code, message, results, onlineCount } = data
          const { msg_type, msg_id } = results
          console.log(msg_id,this.sendingMsgs)
          msg_id && delete this.sendingMsgs[msg_id]
           this.$refs.messages[this.messages.length-1].sending = false
          if (msg_type !== "ACK") {
            // PING心跳 ENTER进入聊天室广播 MESSAGE消息收发
            if(!this.self) this.messages.push(results)
            this.total_count = onlineCount ? onlineCount : 0
            this.scrollBottom(true)
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@orange: #ff6e00;
@green: #00b9a3;
.colorange {
  color: @orange;
}
.chat {
  width: 100%;
  height: 100%;
  position: relative;
  color: #333;
  font-size: 12px;
  background: #f5f5f5;
  overflow: hidden;
  .header {
    background: #fff;
    padding: 10px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }
  .box-card {
    padding: 50px 10px 40px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    background: #fff;
    width: 100%;
    .flex {
      display: flex;
    }
  }
}
</style>
