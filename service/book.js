const Book = require('../models/Book')
const db = require('../db')
const _ = require('lodash')

// 检查电子书是否存在
function exist() { }

// 移出电子书
function removeBook() { }

// 向数据库中插入目录
async function insertContents(book) {
  const contents = book.getContents()
  if (contents && contents.length > 0) {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i]
      // 使用lodash.pick()取出数据库中所需的信息
      const _content = _.pick(content, [
        'fileName',
        'id',
        'href',
        'order',
        'level',
        'label',
        'pid',
        'navId'
      ])
      // console.log('_content', _content)
      await db.insert(_content, 'contents')
    }
  }
}

// 新增电子书
function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await exist(book)
        if (result) {
          // 当新增的电子书在数据库中已存在时，移出新增电子书并提示
          await removeBook(book)
          reject(new Error('该电子书已存在'))
        } else {
          // 向数据库中插入电子书
          await db.insert(book.toDB(), 'book')
          // 向数据库中插入目录
          await insertContents(book)
          resolve()
        }
      } else {
        reject(new Error('新增的图书信息不合法'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  insertBook
}