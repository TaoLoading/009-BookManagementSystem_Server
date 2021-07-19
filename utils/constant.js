/* 工具参数 */

module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  // token校验失败状态码
  CODE_TOKEN_EXPIRED: -2,
  debug: true,
  // SALT加密
  PWD_SALT: 'admin_imooc_node',
  // 密钥
  PRIVATE_KEY: 'bookmanagementsystem',
  // token过期时间，此处为一小时
  JWT_EXPIRED: 60 * 60,
  // 电子书上传的目录路径
  UPLOAD_PATH: 'D:/MyTest/upload',
  // 电子书上传的url地址
  UPLOAD_URL: 'http://localhost:8089',
  // 电子书上传格式限制
  MINE_TYPE_EPUB: 'application/epub+zip'
}