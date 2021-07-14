const express = require('express')
const Result = require('../models/Result')
const { login, findUser } = require('../service/user')
const { md5, decoded } = require('../utils')
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/login',
  [
    body('username').isString().withMessage('用户名必须为字符串'),
    body('password').isString().withMessage('密码必须为字符串'),
  ],
  function (req, res, next) {
    // 获取express-validator验证表单返回的错误信息
    const err = validationResult(req)
    if (!err.isEmpty()) {
      // 当错误信息不为空时，通过二次解构拿到错误信息
      const [{ msg }] = err.errors
      // 将错误信息使用boom传递到自定义路由异常处理中间件进行处理
      next(boom.badRequest(msg))
    } else {
      // 当错误信息为空时，继续执行登录操作
      let { username, password } = req.body
      // 对password进行加密处理
      password = md5(password + PWD_SALT)
      // 向后台发起登录请求
      login(username, password).then(user => {
        if (!user || user.length === 0) {
          new Result('登录失败').fail(res)
        } else {
          // 使用jwt生成token
          const token = jwt.sign(
            { username },
            // 密钥
            PRIVATE_KEY,
            // 过期时间
            { expiresIn: JWT_EXPIRED }
          )
          new Result({ token }, '登录成功').success(res)
        }
      })
    }
  })

router.get('/info', function (req, res, next) {
  // 获取解析后的值
  const decode = decoded(req)
  if (decode && decode.username) {
    // 当解析后的值包含username时开始查询该用户信息
    findUser(decode.username).then(user => {
      if (user) {
        // 前端中获取的是roles故在此进行改动
        user.roles = [user.role]
        new Result(user, '用户信息查询成功').success(res)
      } else {
        new Result(user, '用户信息查询失败').fail(res)
      }
    })
  } else {
    new Result(user, '用户信息查询失败').fail(res)
  }
})

module.exports = router