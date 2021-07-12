const express = require('express')
const router = require('./router/index')

// 创建express应用
const app = express()

// 使用express解析请求参数
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// 设置路由
app.use('/', router)

// 监听'/'路径的get请求
app.get('/', function (req, res) {
  res.send('hello node')
})

// 使用express监听5000端口号发起的http请求
const server = app.listen(5000, function () {
  const { address, port } = server.address()
  console.log('Http服务器启动成功：http://localhost:5000')
})