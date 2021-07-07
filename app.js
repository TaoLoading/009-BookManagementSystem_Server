const express = require('express')
const router = require('./router/index')

// 创建 express 应用
const app = express()

// 设置路由
app.use('/', router)

// 监听 / 路径的 get 请求
app.get('/', function (req, res) {
  res.send('hello node')
})

// 使 express 监听 5000 端口号发起的 http 请求
const server = app.listen(5000, function () {
  const { address, port } = server.address()
  console.log('Http服务器启动成功：http://%s:%s', address, port)
})