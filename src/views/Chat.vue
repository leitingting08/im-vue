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
    <span @click="scrollBottom(true)" class="backToBottom" v-show="scrolled">
      <i class="el-icon-caret-bottom" />
    </span>
    <div class="footer">
      <div class="flex">
        <el-input v-model="inputMsg" @keyup.enter.native="sendMsg" />
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
      reconnectTimes: 0,
      reconnectTimer: null,
      scrolled: false,
    }
  },
  async created() {
    await this.getHistoryMsgs()
    await this.initChat()
  },
  mounted() {
    this.open()
    this.$nextTick()
    this.setScroll()
    window.addEventListener(
      "scroll",
      this.throttle((e) => {
        this.setScroll()
      }),
      true
    )
  },
  methods: {
    setScroll() {
      const sHight = this.$refs.chat.scrollHeight
      const wHeight = this.$refs.chat.scrollTop + this.$refs.chat.clientHeight
      this.scrolled = wHeight !== sHight
    },
    throttle(fn, interval = 300) {
      // 函数节流--eg:用于监听srcoll
      let canRun = true
      return function () {
        if (!canRun) return
        canRun = false
        setTimeout(() => {
          fn.apply(this, arguments)
          canRun = true
        }, interval)
      }
    },
    debounce(fn, interval = 300) {
      // 函数防抖--eg:用于远程联想搜索
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          fn.apply(this, arguments)
        }, interval)
      }
    },
    async initChat() {
      await this.initSocket()
      await this.initSocketEvent()
    },
    async initSocket(force = false) {
      const { chatClient } = this
      if (!chatClient.isOpen || force) {
        this.self &&
          (await chatClient.init(
            `${wsURL}?user=${this.self}&room=${this.$route.params.id}`
          ))
      } else {
        clearInterval(this.reconnectTimer)
      }
    },
    initSocketEvent() {
      this.chatClient
        .on("message", (data) => {
          if (data && data.results) {
            const { code, message, results, onlineCount } = data
            const { msg_type, msg_id, user_name } = results
            // 监测是不是异常断开-服务端会发一个pong 如果收到就返回pong
            if (code === 0) {
              if (msg_type !== "PONG") {
                console.log("接收", msg_id, this.sendingMsgs)
                if (msg_id) {
                  delete this.sendingMsgs[msg_id]
                }
                const alias = this.messages.findIndex(
                  (item) => item.msg_id === msg_id
                )
                // PING心跳 ENTER进入聊天室广播 MESSAGE消息收发
                if (
                  alias === -1 ||
                  this.self !== user_name ||
                  msg_type !== "MESSAGE"
                ) {
                  this.messages.push(results)
                }
                if (this.$refs.messages && this.$refs.messages.length)
                  this.$refs.messages.forEach((el) => {
                    if (el.id === msg_id) {
                      el.sending = false
                    }
                  })
              }
              this.total_count = onlineCount ? onlineCount : 0
            } else {
              this.$messages({
                message: "网络异常，请检查网络",
                type: "error",
              })
            }
          }
        })
        .on("close", async () => {
          if (navigator.onLine) {
            this.reconnectTimes += 1
            this.reconnectTimer = setInterval(() => {
              this.reConnect()
            }, 3000)
          }
        })
        .on("open", () => {
          console("open")
          if (this.chatClient.isOpen) {
            this.reconnectTimes = 0 // 重连成功归0
            clearInterval(this.reconnectTimer)
            return
          }
        })
    },
    async sendAgain(send_time, msg_content, msg_id) {
      // 发送失败重新发送
      this.initSocketEvent()
      const timestamp = new Date().valueOf()
      const results = {
        msg_type: "MESSAGE",
        send_time: timestamp,
        user_name: this.self,
        msg_content: msg_content,
        msg_id: msg_id,
      }
      this.chatClient.send(results)
      await this.$nextTick()
      if (this.$refs.messages.length)
        this.$refs.messages.forEach((el) => {
          if (this.sendingMsgs[el.id] && el.id === msg_id) {
            el.sending = true
            el.sendError = false
            el.waiting()
          }
        })
    },
    async sendMsg() {
      const timestamp = new Date().valueOf()
      console.log("发送", timestamp)
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
      this.scrollBottom()
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
            const res = await axios.post(userSaveUrl, { user_name: value })
            if (res.data.success) {
              this.self = value
              await this.initChat()
              that.chatClient.send({
                msg_type: "ENTER",
                send_time: new Date().valueOf(),
                msg_id: new Date().valueOf(),
                user_name: value,
              })
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
    reConnect() {
      console.log("重连", this.chatClient.isOpen)
      if (this.chatClient.isOpen) {
        clearInterval(this.reconnectTimer)
        return
      }
      if (this.reconnectTimes > 20) {
        clearInterval(this.reconnectTimer)
        this.$message({
          message: `断线超过20次，请检查网络状况`,
          type: "error",
        })
        return
      }
      this.reconnectTimes += 1
      this.initSocket(true)
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
  .backToBottom {
    position: fixed;
    bottom: 50px;
    right: 20%;
    background-color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: @green;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    z-index: 5;
  }
}
</style>
