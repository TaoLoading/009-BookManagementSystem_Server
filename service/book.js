const Book = require('../models/Book')
const db = require('../db')
const _ = require('lodash')

// 检查电子书是否存在
function exist(book) {
  const { title, author, publisher } = book
  // 当标题、作者、出版社都相同时了，则证明该电子书已存在
  const sql = `select * from book where title= '${title}' and author= '${author}' and publisher = '${publisher}'`
  return db.queryOne(sql)
}

// 移出电子书
async function removeBook(book) {
  if (book) {
    // 在上传到的文件夹中对此电子书进行删除
    book.reset()
    /* if (book.fileName) {
      console.log(book.fileName)
      // 从数据库中对此电子书进行删除
      const removeBookSql = `delete from book where fileName=${book.fileName}`
      const removeContentsSql = `delete from contents where fileName=${book.fileName}`
      await db.querySql(removeBookSql)
      await db.querySql(removeContentsSql)
    } */
  }
}

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
        'text',
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
        reject(new Error('新增的电子书信息不合法'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 更新电子书
function updateBook(book){
  return new Promise(async(resolve,reject)=>{
    try {
      if(book instanceof Book){
        // 先查询电子书信息，防止传入的部分信息在数据库中缺失
        const result = await getBook(book)
        if(result){
          const model = book.toDB()
          await db.update(model,'book',`where fileName='${book.fileName}'`)
          resolve()
        }
      } else{
        reject(new Error('新增的电子书信息不合法'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 查询电子书信息
function getBook(fileName) {
  return new Promise( async (resolve,reject)=>{
    // 从数据库中查询电子书信息和目录
    const bookSql = `select * from book where fileName='${fileName.fileName}'`
    const contentsSql = `select * from contents where fileName = '${fileName.fileName}' order by \`order\``
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)
    // book.contents = contents
    if(book){
      book.contentsTree = Book.genContentsTree(contents)
      // console.log('树是',book.contentsTree);
    resolve({book})
    } else {
      reject(new Error('电子书不存在'))
    }
    // resolve({book, contents})
  })
}

// 获取下拉菜单中的分类信息
async function getCategory() {
  const sql = 'select * from category order by category asc'
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.categoryText,
      value: item.category,
      num: item.num
    })
  })
  return categoryList
}

module.exports = {
  insertBook,
  updateBook,
  getBook,
  getCategory
}