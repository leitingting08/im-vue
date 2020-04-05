import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './styles/iconfont.less'
import VideoPlayer from 'vue-video-player'
import 'vue-video-player/src/custom-theme.css'
import 'video.js/dist/video-js.css'
  
Vue.use(VideoPlayer)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
