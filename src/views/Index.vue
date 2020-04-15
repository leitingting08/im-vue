<template>
  <div class="index">
    <div class="title">弹幕测试标题</div>
    <div class="video-container">
      <video ref="videoPlayer" src="~@/assets/test.mp4" preload="auto" class="video"></video>
      <canvas ref="canvas" width="952" height="532" class="canvas"></canvas>
    </div>

   <div class="footer">
      <div class="flex">
        <i class="iconfont icon-avatar" />
        <el-input v-model="inputMsg" @keyup.enter.native="sendMsg" />
        <el-button type="primary" @click="sendMsg">发送弹幕</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      barrageList: [],
      canvas: null,
      w: null,
      h: null,
      ctx: null,
      content: '',
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas
    let rect = this.canvas.getBoundingClientRect()
    this.w = rect.right - rect.left
    this.h = rect.bottom - rect.top
    this.ctx = this.canvas.getContext('2d')

    const textList = ['富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善']
    this.draw()
    textList.forEach((t) => {
      this.shoot(t)
    })
  },
  methods: {
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
        font: '30px Arial'
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
      requestAnimationFrame(this.draw.bind(this))
    },
    //绘制文字
    drawText(barrage) {
      this.ctx.fillStyle = barrage.color
      this.ctx.font = barrage.font
      this.ctx.fillText(barrage.value, barrage.left, barrage.top)
    },

    //获取随机颜色
    getColor() {
      return '#' + Math.floor(Math.random() * 0xffffff).toString(16)
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
  },
}
</script>

<style lang="less" scoped>
.index {
  .title{
    padding: 10px;
  }
  .video-container {
    position: relative;
    width: 952px;
    height: 532px;
    margin: auto;
    .video {
      width: 100%;
      height: 100%;
    }
    .canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
  .footer{
    width: 940px;
    margin: auto;
    .iconfont{font-size: 40px;margin-right: 5px;color:cornflowerblue;}
    .flex{
      display: flex;
    }
  }
}
</style>
