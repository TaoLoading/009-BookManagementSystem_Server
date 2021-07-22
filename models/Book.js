/* 封装电子书模型 */

const { MINE_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH } = require('../utils/constant')
const fs = require('fs')
const Epub = require('../utils/epub')
// 用于解析电子书
const xml2js = require('xml2js').parseString
const path = require('path')

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
    /* if (!fs.existsSync(unzipPath)) {
      // 创建解压文件夹
      fs.mkdirSync(unzipPath, { recursive: true })
    } */
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
    // 封面图片的URL
    this.coverUrl = ''
    // 封面图片的路径
    this.coverPath = ''
    // 分类ID
    this.category = -1
    // 分类名称
    this.categoryText = ''
    // 语种
    this.language = ''
  }

  createBookFromData(data) {
    this.fileName = data.fileName
    this.cover = data.coverPath
    this.title = data.title
    this.author = data.author
    this.publisher = data.publisher
    this.bookId = data.fileName
    this.language = data.language
    this.rootFile = data.rootFile
    this.originalName = data.originalName
    this.path = data.path || data.filePath
    this.filePath = data.path || data.filePath
    this.unzipPath = data.unzipPath
    this.coverPath = data.coverPath
    this.createUser = data.username
    this.createDt = new Date().getTime()
    this.updateDt = new Date().getTime()
    this.updateType = data.updateType === 0 ? data.updateType : 1
    this.contents = data.contents || []
    this.category = data.category || 99
    this.categoryText = data.categoryText || '自定义'
  }

  // 解析电子书
  parse() {
    return new Promise((resolve, reject) => {
      const bookPath = `${UPLOAD_PATH}${this.filePath}`
      // 错误处理
      if (!fs.existsSync(bookPath)) {
        reject(new Error('电子书不存在'))
      }
      // 使用epub库解析电子书，步骤由epub库给出
      const epub = new Epub(bookPath)
      epub.on('error', err => {
        reject(err)
      })
      epub.on('end', err => {
        if (err) {
          reject(err)
        } else {
          // console.log(epub.metadata)
          const { language, creator, creatorFileAs, title, cover, publisher } = epub.metadata
          if (!title) {
            reject(new Error('图书标题为空'))
          } else {
            // 更新电子书信息
            this.title = title
            this.language = language || 'en'
            this.author = creator || creatorFileAs || 'unknown'
            this.publisher = publisher || 'unknown'
            this.rootFile = epub.rootFile
            // 获取封面
            const handleGetImage = (err, file, mineType) => {
              // err：报错；file：文件的Buffer；mineType：图片格式(形式为image/jpeg)
              if (err) {
                reject(err)
              } else {
                // 图片后缀，即那种格式的图片
                const suffix = mineType.split('/')[1]
                // 图片存放路径
                const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                // 图片存放url
                const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                // 将Buffer写入硬盘
                fs.writeFileSync(coverPath, file, 'binary')
                this.coverPath = `/img/${this.fileName}.${suffix}`
                this.coverUrl = coverUrl
                resolve(this)
              }
            }
            try {
              // 解压电子书
              this.unzip()
              // 解析目录
              this.parseContents(epub).then(({ chapters, chapterTree }) => {
                // 获取章节信息
                this.contents = chapters
                // 获取目录树
                this.contentsTree = chapterTree
                // 获取封面
                epub.getImage(cover, handleGetImage)
              })
            } catch (error) {
              reject(error)
            }
          }
        }
      })
      epub.parse()
    })
  }

  // 解压电子书
  unzip() {
    const AmdZip = require('adm-zip')
    const zip = new AmdZip(Book.genPath(this.path))
    // 规定解压后存放地址
    zip.extractAllTo(Book.genPath(this.unzipPath, true))
  }

  // 解析目录
  parseContents(epub) {
    // 获取Ncx即目录文件
    function getNcxFilePath() {
      const spine = epub && epub.spine
      const mainfest = epub && epub.mainfest
      const ncx = spine.toc && spine.toc.href
      const id = spine.toc && spine.toc.id
      if (ncx) {
        return ncx
      } else {
        return mainfest[id].href
      }
    }
    // 查找子目录
    // pid为父级id
    function findParent(array, level = 0, pid = '') {
      return array.map(item => {
        item.level = level
        item.pid = pid
        if (item.navPoint && item.navPoint.length > 0) {
          // 当子节点为数组则证明存在节点嵌套，继续查找
          item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
        } else if (item.navPoint) {
          item.navPoint.level = level + 1
          item.navPoint.pid = item['$'].id
        }
        return item
      })
    }
    // 将目录数组扁平化
    function flatten(array) {
      return [].concat(...array.map(item => {
        if (item.navPoint && item.navPoint.length > 0) {
          // 当子节点为数组则证明存在节点嵌套，继续扁平化
          return [].concat(item, ...flatten(item.navPoint))
        } else if (item.navPoint) {
          return [].concat(item, item.navPoint)
        }
        return item
      }))
    }

    // 目录文件绝对路径
    const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
    if (fs.existsSync(ncxFilePath)) {
      return new Promise((resolve, reject) => {
        const xml = fs.readFileSync(ncxFilePath, 'utf-8')
        // 获得目录文件所在文件夹的绝对路径
        const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, '')
        const fileName = this.fileName
        const unzipPath = this.unzipPath
        xml2js(xml, {
          // 解析配置
          explicitArray: false,
          ignoreAttrs: false
        }, function (err, json) {
          if (err) {
            reject(err)
          } else {
            const navMap = json.ncx.navMap
            if (navMap.navPoint && navMap.navPoint.length > 0) {
              navMap.navPoint = findParent(navMap.navPoint)
              // 将目录数组扁平化
              const newNavMap = flatten(navMap.navPoint)
              // 存放章节的数组
              const chapters = []
              // 对章节信息进行补充规范
              newNavMap.forEach((chapter, index) => {
                // 章节相对路径
                const src = chapter.content['$'].src
                // 章节绝对路径
                chapter.id = `${src}`
                chapter.href = `${dir}/${src}`.replace(unzipPath, '')
                chapter.text = `${UPLOAD_URL}${dir}/${src}`
                chapter.label = chapter.navLabel.text || ''
                chapter.navId = chapter['$'].id
                chapter.fileName = fileName
                chapter.order = index + 1
                chapters.push(chapter)
              })
              // 目录树
              const chapterTree = []
              chapters.forEach(c => {
                c.children = []
                if (c.pid == '') {
                  // pid为空则证明是一级目录，直接push
                  chapterTree.push(c)
                } else {
                  // 多级目录则找到对应的父级进行push
                  const parent = chapters.find(_ => _.navId == c.pid)
                  parent.children.push(c)
                }
              })
              resolve({ chapters, chapterTree })
            } else {
              reject('目录解析失败，目录数为0')
            }
          }
        })
      })
    } else {
      throw new Error('目录对应的资源文件不存在')
    }
  }

  // 移出文件夹中已上传的文件、封面及解压文件夹
  reset() {
    if (Book.pathExists(this.filePath)) {
      // 删除文件
      fs.unlinkSync(Book.genPath(this.filePath))
    }
    // 删除图片存在问题，初步分析是因为存入时存的是url而不是path(debug)
    /* if (Book.pathExists(this.coverPath)) {
      // 删除封面
      fs.unlinkSync(Book.genPath(this.coverPath))
    } */
    if (Book.pathExists(this.unzipPath)) {
      // 删除解压文件夹
      fs.rmdirSync(Book.genPath(this.unzipPath), { recursive: true })
    }
  }

  // 查看文件路径是否存在
  static pathExists(path) {
    if (path.startsWith(UPLOAD_PATH)) {
      return fs.existsSync(path)
    } else {
      return fs.existsSync(Book.genPath(path))
    }
  }

  // 将相对路径转化为绝对路径
  static genPath(path) {
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    return `${UPLOAD_PATH}${path}`
  }

  // 筛选对象所带属性，使其符合数据库的要求
  toDB() {
    return {
      fileName: this.fileName,
      cover: this.coverPath,
      title: this.title,
      author: this.author,
      publisher: this.publisher,
      bookId: this.fileName,
      language: this.language,
      rootFile: this.rootFile,
      originalName: this.originalName,
      filePath: this.filePath,
      unzipPath: this.unzipPath,
      coverPath: this.coverPath,
      createUser: this.createUser,
      createDt: this.createDt,
      updateDt: this.updateDt,
      updateType: this.updateType,
      category: this.category,
      categoryText: this.categoryText
    }
  }

  getContents() {
    return this.contents
  }
}

module.exports = Book