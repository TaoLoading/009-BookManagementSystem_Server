const express = require('express')
const { querySql } = require('../db')
const Result = require('../models/Result')
const { login } = require('../service/user')
const { md5 } = require('../utils')
const { PWD_SALT } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')

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
      // 登录处理
      login(username, password).then(user => {
        if (!user || user.length === 0) {
          new Result('登录失败').fail(res)
        } else {
          new Result('登录成功').success(res)
        }
      })
    }
  })

router.get('/info', function (req, res, next) {
  res.json('user info...')
})

module.exports = router