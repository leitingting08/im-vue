<template>
  <div class="chat">
    <el-card class="box-card"></el-card>
    <div class="global-flex">
      <el-input/><el-button type="primary">发送</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  data() {
    return {
      socket: null,
    }
  },
  mounted() {
    this.open()
  },
  methods: {
    open(){
      this.$prompt('请输入昵称', '提示', {
         showClose: false,
         showCancelButton: false,
          confirmButtonText: '确定',
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: '名称格式不正确'
        }).then(({ value }) => {
          console.log(value)
          this.socket = new WebSocket('ws://localhost:8086')
          this.socket.send(value)
        })
    }
  },
}
</script>

<style lang="less" scoped>
.chat{
  .box-card{
    min-height: 800px;
  }
  .global-flex{
    display: flex;
  }
}
</style>
