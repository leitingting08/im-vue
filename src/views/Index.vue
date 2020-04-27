<template>
  <div class="index">
    <div class="index-container" v-for="({name,title,img,avatar},index) in data" :key="index">
      <!-- 标题 -->
      <div class="index-container-title">
        <div class="l-con">
          <svg class="live" viewBox="0 0 1024 1024"><path d="M392.448 275.911111a92.416 92.416 0 1 1-184.832 0 92.416 92.416 0 0 1 184.832 0" fill="#23ADE5"></path><path d="M826.624 464.583111l-63.744 36.864v-48.64a72.206222 72.206222 0 0 0-71.68-71.936H190.72a72.192 72.192 0 0 0-71.936 71.936V748.231111a71.936 71.936 0 0 0 71.936 71.936H691.2a71.936 71.936 0 0 0 71.936-71.936v-23.808l63.488 37.888a51.2 51.2 0 0 0 76.8-44.544V508.871111a51.2 51.2 0 0 0-76.8-44.288M572.928 369.351111c79.459556 0.142222 143.985778-64.156444 144.128-143.616 0.142222-79.459556-64.156444-143.985778-143.616-144.128-79.260444-0.142222-143.701333 63.857778-144.128 143.104-0.426667 79.459556 63.644444 144.213333 143.104 144.64h0.512" fill="#48CFE5"></path><path d="M425.216 512.967111l124.16 71.936a25.6 25.6 0 0 1 0 42.496l-124.16 71.68a25.6 25.6 0 0 1-37.12-21.248V534.471111a25.6 25.6 0 0 1 37.12-21.504" fill="#FDDE80"></path></svg>
          <span class="name">{{ title }}</span>
        </div>
      </div>
      <!-- 房间块 -->
      <div class="index-container-grid">
        <div class="block" v-for="i in 8" :key="i" @click="openRoom(i, name)">
          <div class="pic">
            <img :src="img" alt="">
            <div class="count">
              <i class="iconfont icon-users" /> 250.5万
            </div>
          </div>
          <div class="up">
            <img :src="avatar" alt="">
            <div class="txt">
              <p class="name">{{ name }}</p>
              <p title="小学生来啦！" class="desc">小学生来啦！</p>
              <p class="tag">王者荣耀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const img0 = require('@/assets/pic.webp')
const img1 = require('@/assets/chat1.gif')
const img2 = require('@/assets/course.webp')
const img3 = require('@/assets/chat.jpg')
const avatar0 = require('@/assets/avatar.jpg')
const avatar1 = require('@/assets/avatar1.gif')
const avatar2 = require('@/assets/avatar2.jpg')
const avatar3 = require('@/assets/avatar3.jpg')

export default {
  name: 'Index',
  data() {
    return {
      data:[
        {name: 'room',title:'动画',img: img0, avatar: avatar0},
        {name: 'chat',title:'聊天室',img: img1, avatar: avatar1},
        {name: 'course',title:'直播课堂',img: img2, avatar: avatar2},
        {name: 'live',title:'游戏直播',img: img3, avatar: avatar3}
      ]
    }
  },
  mounted() {
  
  },
  methods: {
    openRoom(i,name){
      if(name){
        this.$router.push({
          name:name,
          params:{
            id: i
          }
        })
      }
    }
  },
}
</script>

<style lang="less" scoped>
.index {
  &-container{
    width: 1000px;
    margin:30px auto;
    &-title{
      padding: 50px 0px 20px;
      .l-con{
        display: flex;
        align-items: center;
        
        .live{
          width: 40px;
        }
        .name{
          margin: 0 20px 0 10px;
          color:#333;
          vertical-align: bottom;
          font-size: 20px;
          line-height: 36px;
        }
        .text-info{
          color: #505050;
          line-height: 36px;
        }
      }
    }
    &-grid{
      display: grid;
      grid-template-columns: 25% 25% 25% 25%;
      .block{
        cursor: pointer;
        &:hover{
          opacity: 0.6;
        }
        .pic{
          position: relative;
          // height: 500px;
         img{
            border-radius: 3px;
            width: 96%;
         }
          .count{
            position: absolute;
            color: #fff;
            left: 10px;
            top: 113px;
            z-index: 1;
            font-size: 12px;
          }
        }
        .up{
          color: #666;
          display: flex;
          padding: 15px 0 30px;
          img{
            width: 60px;
            border-radius: 50%;
           
          }
          .txt{
             padding-left: 10px;
          }
        }
      }
    }
  }
}
</style>
