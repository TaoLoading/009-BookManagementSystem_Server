const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

// MD5加密
function md5(s) {
  // 注意参数需要为 String 类型，否则会出错
  return crypto.createHash('md5')
    .update(String(s)).digest('hex')
}

// 解析JWT Token
function decoded(req) {
  // 在请求头中拿到token
  let token = req.get('Authorization')
  // 对'Bearer '进行删除
  if (token.indexOf('Bearer') === 0) {
    token = token.replace('Bearer ', '')
  }
  // 返回解析后的值
  return jwt.verify(token, PRIVATE_KEY)
}

module.exports = { md5, decoded }