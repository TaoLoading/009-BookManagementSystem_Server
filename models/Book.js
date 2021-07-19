/* 封装电子书模型 */

const { MINE_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH } = require('../utils/constant')
const fs = require('fs')

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
    const { destination, filename, originalname, mimetype = MINE_TYPE_EPUB, path } = file
    // 后缀名
    const suffix = mimetype === MINE_TYPE_EPUB ? '.epub' : ''
    // 电子书原路径
    const oldBookPath = path
    // 电子书的目录路径
    const bookPath = `${destination}/${filename}${suffix}`
    // 电子书的url地址
    const url = `${UPLOAD_URL}/book/${filename}${suffix}`
    // 电子书解压后的目录路径
    const unzipPath = `${UPLOAD_PATH}/unzip/${filename}${suffix}`
    // 电子书解压后的url地址
    const unzipUrl = `${UPLOAD_URL}/unzip/${filename}${suffix}`
    // fs.existsSync(path)：存在路径返回true，不存在返回false
    if (!fs.existsSync(unzipPath)) {
      // 创建解压文件夹
      fs.mkdirSync(unzipPath, { recursive: true })
    }
    if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
      // 对文件重命名，添加后缀名
      fs.renameSync(oldBookPath, bookPath)
    }
    // 电子书的文件名
    this.fileName = filename
    // 电子书原文件名
    this.originalName = originalname
    // 电子书的相对路径
    this.path = `/book/${filename}${suffix}`
    // 电子书的绝对路径
    this.filePath = this.path
    // 电子书的url
    this.url = url
    // 电子书解压后的相对路径
    this.unzipPath = `/unzip/${filename}`
    // 电子书解压后的url
    this.unzipUrl = unzipUrl
    // 标题或书名
    this.title = ''
    // 作者
    this.author = ''
    // 出版社
    this.publisher = ''
    // 目录
    this.contents = []
    // 封面图片URL
    this.cover = ''
    // 分类ID
    this.category = -1
    // 分类名称
    this.categoryText = ''
    // 语种
    this.language = ''
  }

  createBookFromData(data) {
    console.log('createBookFromData', data)
  }
}

module.exports = Book