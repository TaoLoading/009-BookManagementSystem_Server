/* 封装电子书模型 */

const MINE_TYPE_EPUB = require('../utils/constant')

class Book {
  constructor(file, data) {
    // 根据传入file或data分别进行不同操作
    if (file) {
      this.createBookFromFile(file)
    } else {
      this.createBookFromData(data)
    }
  }

  createBookFromFile(file) {
    // console.log('createBookFromFile', file)
    // 从响应信息中获取信息
    const { destination, filename, mimetype = MINE_TYPE_EPUB, path } = file
    // 添加后缀名
    const suffix = mimetype === MINE_TYPE_EPUB ? '.epub' : ''
    // 文件原路径
    const oldBookPath = path
    // 添加后缀后的路径
    const bookPath = `${destination}/${filename}${suffix}`
  }

  createBookFromData(data) {
    console.log('createBookFromData', data)
  }
}

module.exports = Book