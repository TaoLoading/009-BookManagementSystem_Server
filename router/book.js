const express = require('express')
const multer = require('multer')
const { UPLOAD_PATH } = require('../utils/constant')
const Result = require('../models/Result')
const Book = require('../models/Book')
const boom = require('boom')
const { decoded } = require('../utils')
const bookService = require('../service/book')

const router = express.Router()

// 上传电子书
router.post('/upload',
  // 使用multer进行上传设置。dest为上传地址，single为上传单个文件
  multer({ dest: `${UPLOAD_PATH}/book` }).single('file'),
  function (req, res, next) {
    if (!req.file || req.file.length === 0) {
      new Result('上传失败').fail(res)
    } else {
      const book = new Book(req.file)
      book.parse()
        .then(book => {
          new Result(book, '上传成功').success(res)
        })
        .catch(err => {
          next(boom.badImplementation(err))
        })
    }
  }
)

// 新增电子书
router.post('/create',
  function (req, res, next) {
    const decode = decoded(req)
    if (decode && decode.username) {
      req.body.username = decode.username
    }
    const book = new Book(null, req.body)
    bookService.insertBook(book)
      .then(() => {
        new Result('新增电子书成功').success(res)
      })
      .catch(error => {
        next(boom.badImplementation(error))
      })
  }
)

// 更新电子书
router.post('/update',
  function (req, res, next) {
    const decode = decoded(req)
    if (decode && decode.username) {
      req.body.username = decode.username
    }
    const book = new Book(null, req.body)
    bookService.updateBook(book)
      .then(() => {
        new Result('更新电子书成功').success(res)
      })
      .catch(error => {
        next(boom.badImplementation(error))
      })
  }
)

// 获取电子书信息
router.get('/get',
  function (req, res, next) {
    const fileName = req.query
    if (!fileName) {
      next(boom.badRequest(new Error('参数fileName不能为空')))
    } else {
      bookService.getBook(fileName)
        .then(book => {
          new Result(book, '获取图书成功').success(res)
        })
        .catch(err => {
          next(boom.badImplementation(err))
        })
    }
  }
)

// 获取下拉菜单中的分类信息
router.get('/category', function (req, res, next) {
  bookService.getCategory().then(category => {
    new Result(category, '获取成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

// 获取表格中的数据
router.get('/list', function (req, res, next) {
  bookService.listBook(req.query)
    .then(({ list, count, page, pageSize }) => {
      new Result(
        { list, count, page: +page, pageSize: +pageSize },
        '获取图书列表成功',
        {
          page: Number(page),
          pageSize: Number(pageSize),
          total: count || 0
        }
      ).success(res)
    })
    .catch(err => {
      console.log('/book/list', err)
      next(boom.badImplementation(err))
    })
})

// 删除电子书
router.get('/delete', function (req, res, next) {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空')))
  } else {
    bookService.deleteBook(fileName)
      .then(() => {
        new Result(null, '删除成功').success(res)
      })
      .catch(err => {
        console.log('/book/delete', err)
        next(boom.badImplementation(err))
      })
  }
})

module.exports = router