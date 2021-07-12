const express = require('express')
const Result = require('../models/Result')

const router = express.Router()

router.post('/login', function (req, res, next) {
  console.log(req.body)
  const { username, password } = req.body
  if (username === 'admin' && password === 'admin') {
    new Result('登陆成功').success(res)
  } else {
    new Result('登陆失败').fail(res)
  }
})

router.get('/info', function (req, res, next) {
  res.json('user info...')
})

module.exports = router