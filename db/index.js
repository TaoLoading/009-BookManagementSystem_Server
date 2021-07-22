const mysql = require('mysql')
const config = require('./config')
// const { debug } = require('../utils/constant')
const { isObject } = require('../utils')

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
  // debug && console.log(`查询语句为：${sql}`)
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, result) => {
        if (err) {
          // 错误提示
          // debug && console.log('查询失败，原因:' + JSON.stringify(err))
          reject(err)
        } else {
          // 成功提示
          // debug && console.log('查询成功', JSON.stringify(result))
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

// 查询单个目标
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

// 新增电子书
function insert(model, tableName) {
  return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('新增电子书失败，电子书信息格式不正确'))
    } else {
      const keys = []
      const values = []
      // 遍历book获得键与值
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          keys.push(`\`${key}\``)
          values.push(`'${model[key]}'`)
        }
      })
      if (keys.length && values.length) {
        // 拼接sql插入语句
        let sql = `INSERT INTO \`${tableName}\` (`
        const keysString = keys.join(',')
        const valuesString = values.join(',')
        sql = `${sql}${keysString}) values (${valuesString})`
        // debug && console.log(`插入语句为：${sql}`)
        // 将sql执行到数据库中
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (error) {
          reject(error)
        } finally {
          // 释放连接
          conn.end()
        }
      } else {
        reject(new Error('插入数据库失败，对象不合法'))
      }
    }
  })
}

module.exports = {
  querySql,
  queryOne,
  insert
}