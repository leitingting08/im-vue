const path = require('path')

module.exports = {
  devServer: {
    disableHostCheck: true
  },
  runtimeCompiler: true,
  publicPath:'',
  configureWebpack: {
    output: {
      filename: 'js/[name].js'
    }
  },
  css: {
    extract: {
      filename: 'css/[name].css'
    },
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  chainWebpack: config => {
    config.optimization.splitChunks(false)
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type =>
      config.module.rule('less').oneOf(type)
    )
  }
}
