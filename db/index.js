const mysql = require('mysql')
const config = require('./config')
const { debug } = require('../utils/constant')

// 建立数据库连接
function connect() {
  return mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    // 允许每条mysql语句有多条查询.使用它时要非常注意，因为它很容易引起sql注入
    multipleStatements: true
  })
}

// 查询sql语句
function querySql(sql) {
  const conn = connect()
  debug && console.log(`查询语句为：${sql}`)
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, result) => {
        if (err) {
          // 错误提示
          debug && console.log('查询失败，原因:' + JSON.stringify(err))
          reject(err)
        } else {
          // 成功提示
          debug && console.log('查询成功', JSON.stringify(result))
          resolve(result)
        }
      })
    } catch (error) {
      reject(error)
    } finally {
      // 释放连接避免内存泄漏
      conn.end()
    }
  })
}

// 查询单个用户
function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql).then(result => {
      if (result && result.length > 0) {
        resolve(result[0])
      } else {
        resolve(null)
      }
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = { querySql, queryOne }