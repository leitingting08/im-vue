<template>
  <div class="room">
   <Audio :textList="textList" />
  </div>
</template>

<script>
import Audio from '@/components/Audio'
export default {
    name:'Room',
    components:{ Audio },
    data(){
      return{
        textList: []
      }
    },
    created(){
      if(this.$route.params.id===1){
        this.textList = ['富强民主文明和谐公正法治爱国敬业诚信友善','富强民主文明和谐公正法治爱国敬业诚信友善']
      }
    }
}
</script>