const expressJwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

const jwtAuth = expressJwt({
  secret: PRIVATE_KEY,
  // 设置jwt的算法
  algorithms: ['HS256'],
  // 是否开启校验。设置为false就不进行校验了，游客也可以访问
  credentialsRequired: true
}).unless({
  // 设置 jwt 认证白名单
  path: [
    '/',
    '/user/login'
  ],
})

module.exports = jwtAuth