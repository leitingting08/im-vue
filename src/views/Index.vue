<template>
  <div class="index">
    <div>
      <i class="iconfont icon-users" />
    </div>
    <!-- <video-player ref="videoPlayer" :options="playerOptions"></video-player> -->
    <canvas ref="canvas" style="width: 100%;"></canvas>
    <div>
      <i class="iconfont icon-avatar" />
      <input type="text" @keyup.prevent.stop.enter="send" v-model="content" />
      <button type="submit">发送弹幕</button>
    </div>
  </div>
</template>

<script>
let audio = require('../assets/test.mp4')
export default {
  name: 'Index',
  data() {
    return {
      playerOptions: {
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false, // 如果为true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 是否视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [
          {
            type: 'video/mp4', // 类型
            src: audio, // url地址
          },
        ],
        poster: '', // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true, // 是否显示全屏按钮
        },
      },
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

    const textList = [
      '弹幕',
      '666',
      '233333333',
      'javascript',
      'html',
      'css',
      '前端框架',
      'Vue',
      'React',
      'Angular',
      '测试弹幕效果',
      '弹幕',
      '666',
      '233333333',
      'javascript',
      'html',
      'css',
      '前端框架',
      'Vue',
      'React',
      'Angular',
      '测试弹幕效果',
      '弹幕',
      '666',
      '233333333',
      'javascript',
      'html',
      'css',
      '前端框架',
      'Vue',
      'React',
      'Angular',
      '测试弹幕效果',
    ]
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
  input {
    width: 80%;
    height: 24px;
    margin-left: 10px;
  }
  button {
    height: 28px;
    border-radius: 2em;
    background: cornflowerblue;
    color: #fff;
    border: 0;
    margin-left: 10px;
  }
}
</style>
