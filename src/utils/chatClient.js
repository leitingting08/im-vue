class chatClient {
  constructor () {
    this.socket = null
    this.eventBus = {}
    this.connected = false
    this.msgEventMap = {
      1: 'ontext',
      2: 'onimage',
      3: 'onsys',
      4: 'ondoctor',
      5: 'onack'
    }
    // 5秒一次心跳监测 实现长连接
    setInterval(() => {
      this.isOpen && this.ping()
    }, 5000) 
  }

  get isConnecting () {
    const { socket } = this
    return socket ? socket.readyState === socket.CONNECTING : false
  }
  get isOpen () {
    const { socket } = this
    return socket ? socket.readyState === socket.OPEN : false
  }
  get isClosing () {
    const { socket } = this
    return socket ? socket.readyState === socket.CLOSING : false
  }
  get isClose () {
    const { socket } = this
    return socket ? socket.readyState === socket.CLOSED : true
  }
  get isActivating () {
    return this.isConnecting || this.isOpen
  }

  ping () {
    this.send({
      msg_type: 'PING'
    })
  }

  async init (url, keepEvent = false) {
    return new Promise((resolve, reject) => {
      if (!keepEvent) {
        this.destroy()
        this.removeEvent()
      }
      this.close()
      this.socket = new WebSocket(url)
      this.socket.addEventListener('open', event => {
        this.connected = true
        this.emit('open', event)
        resolve()
        console.log(this.socket, 'socket连接成功')
      })
      this.socket.addEventListener('message', event => {
        const data = JSON.parse(event.data)
        this.emit('message', data)
        if (data.results && data.results.msg_type) {
          this.emit(this.msgEventMap[data.results.msg_type], data.results)
        }
      })
      this.socket.addEventListener('error', event => {
        this.emit('error', event)
        reject(event)
        console.log('socket出错', event)
      })
      this.socket.addEventListener('close', event => {
        this.socket = null
        this.connected = false
        this.emit('close', event)
        console.log('socket关闭', event)
      })
    })
  }

  send (payload) {
    if (!this.isOpen) {
      console.error('发送失败，socket未连接')
      return
    }
    this.socket.send(JSON.stringify(payload))
  }
  close () {
    this.socket && this.socket.close()
    this.socket = null
  }
  removeEvent () {
    this.eventBus = {}
  }
  on (event, cb) {
    if (this.eventBus[event]) {
      this.eventBus[event].push(cb)
    } else {
      this.eventBus[event] = [cb]
    }
    return this
  }
  destroy () {
    this.close()
    this.removeEvent()
  }
  emit (event, args) {
    if (Array.isArray(this.eventBus[event])) {
      this.eventBus[event].forEach((cb) => { cb(args) })
    }
  }
}

export default chatClient
