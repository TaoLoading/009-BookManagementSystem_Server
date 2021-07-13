/* 用户业务逻辑处理 */

const { querySql, queryOne } = require('../db')

// 登录时查询用户名和密码是否正确
function login(username, password) {
  return querySql(`select * from admin_user where username='${username}' and password='${password}'`)
}

// 查询用户
function findUser(username) {
  return queryOne(` select id,username,nickname,role,avatar from admin_user where username='${username}' `)
}

module.exports = { login, findUser }