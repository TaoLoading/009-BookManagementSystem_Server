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
function updateBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        // 先查询电子书信息，防止传入的部分信息在数据库中缺失
        const result = await getBook(book)
        if (result) {
          const model = book.toDB()
          await db.update(model, 'book', `where fileName='${book.fileName}'`)
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

// 查询电子书信息
function getBook(fileName) {
  return new Promise(async (resolve, reject) => {
    // 从数据库中查询电子书信息和目录
    const bookSql = `select * from book where fileName='${fileName.fileName}'`
    const contentsSql = `select * from contents where fileName = '${fileName.fileName}' order by \`order\``
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)
    // book.contents = contents
    if (book) {
      book.cover = Book.genCoverUrl(book)
      book.contentsTree = Book.genContentsTree(contents)
      // console.log('树是',book.contentsTree);
      resolve({ book })
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

// 获取表格中的数据
async function listBook(p) {
  const {
    page = 1,
    pageSize = 20,
    sort,
    title,
    category,
    author
  } = p
  // 偏移量。即从第几个开始查
  const offset = (page - 1) * pageSize
  let bookSql = 'select * from book'
  // 查询条件并不一定都有，故对where进行设置
  let where = 'where'
  // title存在限制条件时
  title && (where = db.andLike(where, 'title', title))
  // author存在限制条件时
  author && (where = db.andLike(where, 'author', author))
  // category存在限制条件时
  category && (where = db.and(where, 'categoryText', category))
  if (where !== 'where') {
    bookSql = `${bookSql} ${where}`
  }
  // 确定排序规则
  if (sort) {
    // 获取符号。字符串也可以用类似数组的方式取值
    const symbol = sort[0]
    const column = sort.slice(1, sort.length)
    const order = symbol === '+' ? 'asc' : 'desc'
    bookSql = `${bookSql} order by ${column} ${order}`
  }
  // 查询语句。limit限制数量，offset规定偏移量
  bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
  // 统计查询结果数量
  let countSql = `select count(*) as count from book`
  if (where !== 'where') {
    countSql = `${countSql} ${where}`
  }
  const list = await db.querySql(bookSql)
  // 获取封面路径
  list.forEach(book => book.cover = Book.genCoverUrl(book))
  const count = await db.querySql(countSql)
  return { list, count: count[0].count, page, pageSize }
}

// 删除电子书
function deleteBook(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      let book = await getBook(fileName)
      if (book) {
        if (Number(book.updateType) === 0) {
          reject(new Error('内置电子书不能删除'))
        } else {
          const bookObj = new Book(null, book)
          const sql = `DELETE FROM book WHERE fileName='${fileName}'`
          db.querySql(sql).then(() => {
            bookObj.reset()
            resolve()
          })
        }
      } else {
        reject(new Error('电子书不存在'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  insertBook,
  updateBook,
  getBook,
  getCategory,
  listBook,
  deleteBook
}