const express = require('express')
const { querySql } = require('../db')
const Result = require('../models/Result')
const { login } = require('../service/user')
const { md5 } = require('../utils')
const { PWD_SALT } = require('../utils/constant')

const router = express.Router()

router.post('/login', function (req, res) {
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
})

router.get('/info', function (req, res, next) {
  res.json('user info...')
})

module.exports = router