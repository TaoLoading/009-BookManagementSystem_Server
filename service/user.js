/* 用户业务逻辑处理 */

const { querySql } = require('../db')

// 查询用户名和密码
function login(username, password) {
  return querySql(`select * from admin_user where username='${username}' and password='${password}'`)
}

module.exports = { login }