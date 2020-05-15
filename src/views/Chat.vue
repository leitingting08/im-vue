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
          @send-again="sendAgain"
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

const ip =
  process.env.NODE_ENV === "development" ? "127.0.0.1" : "49.235.157.201"
const port = 8086
const wsURL = `ws://${ip}:${port}`
const httpURL = `http://${ip}:${port}`
const historyMsgUrl = `${httpURL}/messages`
const userSaveUrl = `${httpURL}/saveusers`
const myName = sessionStorage.getItem("USER_NAME")

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
      self: myName,
      reConnectTimes: 0,
    }
  },
  created() {
    if (myName) this.initSocket(myName)
    this.getHistoryMsgs()
  },
  mounted() {
    this.open()
    this.handleChat()
    // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口
    window.onbeforeunload = function () {
      this.chatClient.close()
    }
  },
  methods: {
    initSocket(username) {
      this.chatClient.init(
        `${wsURL}?user=${username}&room=${this.$route.params.id}`
      )
    },
    async sendAgain(send_time, msg_content, msg_id) {
      console.log(send_time, msg_content, msg_id)
      delete this.sendingMsgs[send_time]
      this.messages.splice(
        this.messages.findIndex((i) => i.send_time === send_time),
        1
      )
      const timestamp = new Date().valueOf()
      const results = {
        msg_type: "MESSAGE",
        send_time: timestamp,
        user_name: this.self,
        msg_content: msg_content,
        msg_id: msg_id,
      }
      this.sendingMsgs[msg_id] = msg_content
      this.chatClient.send(results)
      if (this.self) this.messages.push(results)
      await this.$nextTick()
      this.$refs.messages.forEach((el) => {
        console.log(el.id)
        if (this.sendingMsgs[el.send_time] && el.id === msg_id) {
          el.sending = true
          el.sendError = false
          // el.isResend = true
        }
      })
      this.scrollBottom(true)
    },
    async sendMsg() {
      const timestamp = new Date().valueOf()
      console.log(timestamp)
      if (!this.inputMsg) return
      const results = {
        msg_type: "MESSAGE",
        send_time: timestamp,
        user_name: this.self,
        msg_content: this.inputMsg,
        msg_id: timestamp,
      }
      this.sendingMsgs[timestamp] = this.inputMsg // 发送消息先进入待发送队列 收到反馈消息后移除
      this.chatClient.send(results)
      if (this.self) this.messages.push(results)
      await this.$nextTick()
      if (this.messages.length)
        this.$refs.messages[this.messages.length - 1].sending = true
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
            behavior: smooth ? "smooth" : "auto",
          })
        } else {
          msgWindow.scrollTop = msgWindow.scrollHeight
        }
      }, 10)
    },
    async getHistoryMsgs() {
      const res = await axios.get(historyMsgUrl)
      if (!res || !res.data.success) {
        this.$message({
          message: `接口请求失败：${res.data.msg || ""}`,
          type: "error",
        })
        return
      }
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
                type: "error",
              })
              return
            }
            this.initSocket(value)
            this.handleChat()
            const res = await axios.post(userSaveUrl, { user_name: value })
            if (res.data.success) {
              that.chatClient.send({
                msg_type: "ENTER",
                send_time: new Date().valueOf(),
                user_name: value,
              })
              this.self = value
              sessionStorage.setItem("USER_NAME", value)
              this.scrollBottom(true)
              done()
            } else {
              that.$message({
                message: res.data.msg || "保存失败",
                type: "error",
              })
            }
          },
        })
      }
    },
    handleChat() {
      // 初始化链接 监听收到的消息
      this.chatClient.on("message", (data) => {
        if (data && data.results) {
          const { code, message, results, onlineCount } = data
          const { msg_type, msg_id, user_name } = results
          // 监测是不是异常断开-服务端会发一个pong 如果收到就返回pong
          if (msg_type !== "PING") {
            if (msg_id) {
              delete this.sendingMsgs[msg_id]
            }
            const alias = this.messages.findIndex(
              (item) => item.msg_id === msg_id
            )
            // if (this.messages.length)
            //   this.$refs.messages[this.messages.length - 1].sending = false
            // PING心跳 ENTER进入聊天室广播 MESSAGE消息收发
            if (
              alias === -1 ||
              this.self !== user_name ||
              msg_type !== "MESSAGE"
            ) {
              this.messages.push(results)
            }
            this.$refs.messages.forEach((el) => {
              if (el.id === msg_id) {
                el.sending = false
              }
            })
            this.total_count = onlineCount ? onlineCount : 0
            this.scrollBottom(true)
          }
        }
      })
      this.chatClient.on("close", () => {
        // 是否断网 socket断开事件触发快于navigator.onLine状态变更，延时再判断
        setTimeout(() => {
          console.log("navigator.onLine:", navigator.onLine)
          if (navigator.onLine) {
            this.reConnect()
          }
        }, 1000)
      })
      window.addEventListener("online", () => {
        console.log("网络恢复连接")
        this.reConnect()
      })
      this.chatClient.on("open", () => {
        this.reConnectTimes = 0 // 重连成功归0
      })
    },
    reConnect() {
      if (this.reConnectTimes > 20) {
        this.$message({
          message: `断线超过20次，请检查网络状况`,
          type: "error",
        })
        return
      }
      this.reConnectTimes += 1
      myName && this.initSocket(myName)
    },
  },
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
