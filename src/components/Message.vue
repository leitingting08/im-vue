<template>
  <div class="message-wrap">
    <div class="txtcenter" v-if="['ENTER', 'LEAVE'].includes(msg_type)">
      <span class="boardcast"
        >{{ send_time | timeFormat }}
        <span class="name">{{ user_name }}<span v-if="self">（我）</span></span>
        <span :class="msg_type === 'ENTER' ? 'colenter' : 'colleave'">
          {{ msg_type === "ENTER" ? "进入" : "离开" }}</span
        >
        房间</span
      >
    </div>
    <div v-if="msg_type === 'MESSAGE'" class="box-card-msg">
      <div :class="self ? 'txtright' : 'txtleft'">
        {{ send_time | timeFormat }}
        <span class="colorange">@{{ user_name }}</span>
      </div>
      <div :class="self ? 'txtright' : 'txtleft'" class="content">
        <span class="message"
          >{{ msg_content }}
          <span class="tooltip" :class="self ? 'left' : 'right'">
            <i class="el-icon-loading" v-if="sending" />
            <el-tooltip
              v-if="sendError"
              effect="dark"
              content="发送超时请点击重试"
              placement="top"
            >
              <span
                class="error-sign"
                @click="sendAgain(send_time, msg_content, id)"
                ><i class="el-icon-warning"
              /></span>
            </el-tooltip>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs"
export default {
  /** 一条聊天消息 */
  name: "Message",
  props: {
    id: [Number, String], // 消息id
    self: Boolean, // 1别人，2来自自己
    msg_type: String, // 见 msgTypes
    msg_content: String, // 消息内容
    user_name: String,
    send_time: [Number, String],
  },
  data() {
    return {
      sending: false, // 是否显示正在发送按钮
      sendError: false, // 是否显示正在发送按钮
      waitingTime: 5000, // 发送超时检测时间
      // isResend: false,
    }
  },
  computed: {
    isSending() {
      if (!this.id) return
      return this.$parent.sendingMsgs[this.id]
    },
  },
  created() {
    this.waiting()
  },
  methods: {
    async waiting() {
      await setTimeout(() => {
        if (this.isSending) {
          console.log("senqq1", this.isSending)
          this.sending = false
          this.sendError = true
        }
      }, this.waitingTime)
    },
    sendAgain(send_time, msg_content, msg_id) {
      this.$emit("send-again", send_time, msg_content, msg_id)
    },
  },
  filters: {
    timeFormat(timestamp) {
      return dayjs(Number(timestamp)).format("YYYY-MM-DD HH:mm:ss")
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
.colenter {
  color: #29c8aa;
}
.colleave {
  color: #5259f4;
}
.message-wrap {
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
    .name {
      color: @orange;
    }
  }
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
    position: relative;
    .tooltip {
      position: absolute;
      .el-icon-loading {
        color: #888;
      }
      &.left {
        left: -20px;
        right: auto;
      }
      &.right {
        left: auto;
        right: -20px;
      }
    }
  }
  .error-sign {
    top: 18px;
    left: 10px;
    height: 1em;
    color: #f55;
    line-height: 1;
    i {
      cursor: pointer;
    }
  }
}
</style>
