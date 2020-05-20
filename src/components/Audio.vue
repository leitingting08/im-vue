<template>
  <div class="index" v-if="vedioId">
    <div class="title">弹幕测试标题</div>
    <div class="video-container">
      <video
        ref="videoPlayer"
        src="~@/assets/test.mp4"
        preload="auto"
        class="video"
        controls
      >
        您的浏览器不支持 video 标签
      </video>
      <canvas ref="canvas" class="canvas"></canvas>
      <div class="controls">
        <i class="el-icon-caret-right" />
      </div>
    </div>

    <div class="footer">
      <div class="flex">
        <i class="iconfont icon-avatar" />
        <el-input v-model.trim="inputMsg" @keyup.enter.native="sendMsg" />
        <el-button type="primary" @click="sendMsg">发送弹幕</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Aduio",
  props: {
    vedioId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      /**
       * @param {string} type 弹幕类型
       * @param {string} value 弹幕内容
       * @param {string} value 弹幕内容
       * @param {string} value 弹幕内容
       * @param {string} value 弹幕内容
       * @param {string} value 弹幕内容
       */
      textList: [
        {
          value: "富强民主文明和谐公正法治爱国敬业诚信友善",
          time: 5,
          color: "red",
          speed: 1,
          fontSize: 22,
        },
        {
          value: "富强民主文明和谐公正法治爱国敬业诚信友善",
          time: 10,
          color: "#00a1f5",
          speed: 1,
          fontSize: 30,
        },
        { value: "富强民主文明和谐公正法治爱国敬业诚信友善", time: 15 },
      ],
      barrageList: [],
      canvas: null,
      w: null,
      h: null,
      ctx: null,
      vedioDom: null,
      inputMsg: "",
      animiate: null,
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    let rect = this.canvas.getBoundingClientRect()
    this.w = rect.right - rect.left
    this.h = rect.bottom - rect.top
    this.ctx = this.canvas.getContext("2d")

    this.draw()
    this.vedioDom = this.$refs.videoPlayer
    let that = this
    this.vedioDom.addEventListener("play", () => {
      console.log("开始播放")
      that.play()
    })

    this.vedioDom.addEventListener("pause", () => {
      console.log("暂定播放")
      that.stop()
    })
  },
  methods: {
    play() {
      const { textList } = this
      let that = this
      textList.forEach((t) => {
        that.shoot(t)
      })
    },
    //添加弹幕列表
    shoot(value) {
      let top = this.getTop()
      let color = this.getColor()
      let offset = this.getOffset()
      let width = Math.ceil(this.ctx.measureText(value).width)

      let barrage = {
        value: value,
        top: top,
        left: this.w,
        color: color,
        offset: offset,
        width: width,
        font: "28px Arial",
      }
      this.barrageList.push(barrage)
    },
    //开始绘制
    draw() {
      if (this.barrageList.length) {
        this.ctx.clearRect(0, 0, this.w, this.h)
        for (let i = 0; i < this.barrageList.length; i++) {
          let b = this.barrageList[i]
          if (b.left + b.width <= 0) {
            this.barrageList.splice(i, 1)
            i--
            continue
          }
          b.left -= b.offset
          this.drawText(b)
        }
      }
      this.animiate = requestAnimationFrame(this.draw.bind(this))
    },
    stop() {
      cancelAnimationFrame(this.animiate)
    },
    //绘制文字
    drawText(barrage) {
      this.ctx.fillStyle = barrage.color
      this.ctx.font = barrage.font
      this.ctx.fillText(barrage.value, barrage.left, barrage.top)
    },

    //获取随机颜色
    getColor() {
      return "#" + Math.floor(Math.random() * 0xffffff).toString(16)
    },

    //获取随机top
    getTop() {
      //canvas绘制文字x,y坐标是按文字左下角计算，预留30px
      return Math.floor(Math.random() * (this.h - 30)) + 30
    },

    //获取偏移量
    getOffset() {
      return +(Math.random() * 4).toFixed(1) + 1
    },
    sendMsg() {
      if (!this.inputMsg) return
      this.shoot(this.inputMsg)
      this.inputMsg = ""
    },
  },
}
</script>

<style lang="less" scoped>
video::-webkit-media-controls {
  // display: none !important;
}
.index {
  .title {
    width: 946px;
    margin: auto;
    padding: 10px;
  }
  .video-container {
    position: relative;
    max-width: 946px;
    max-height: 532px;
    margin: auto;
    .video {
      width: 100%;
      height: 100%;
    }
    .canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .footer {
    width: 940px;
    margin: 10px auto;
    .iconfont {
      font-size: 40px;
      margin-right: 5px;
      color: cornflowerblue;
    }
    .flex {
      display: flex;
    }
  }
}
</style>
