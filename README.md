# 书城管理系统后台代码
## 1.技术栈
主要使用技术栈为Node.js
## 2.部署项目到Nginx
1. 下载Nginx安装包。地址：http://nginx.org/en/download.html
2. 开启Nginx。开启命令为` start nginx.exe `，访问localhost:80查看Nginx是否正常开启；关闭命令为` 	nginx -s quit `，重启命令为` nginx -s reload `
3. 修改配置文件。修改conf目录下的nginx.conf，其中：
   * 修改user为当前登录用户名 + owner
   * 配置http请求
## 3. 配置MySQL
1. 下载MySQL并安装。教程：https://blog.csdn.net/ycxzuoxin/article/details/80908447
2. 创建book数据库。
   * 字符集选择utf8
   * 排序规则选择utf8_general_ci
   * 运行sql文件
## 4.登录API
1. 在user.js中设置'/login'接口
2. 在app.js中使用` app.use(express.urlencoded({ extended: true })) `和` app.use(express.json()) `解析请求参数
3. 使用` curl http://localhost:5000/user/login -d "username=TaoLoading&password=123456" `测试接口
4. 使用cors插件解决跨域问题
## 5.Node连接MySQL并查询用户
1. 安装MySQL库。` npm i -S mysql `
2. 配置db/config.js文件。主要包括数据库信息
3. 配置db/index.js文件。主要包括连接数据库方法、查询数据方法
4. 配置service/user.js文件。主要包括定义登录方法，其中调用查询方法进行查询
5. 在router/user.s文件内引用登录方法进行登录处理
6. 对输入的密码进行加密处理以对应数据库中的经过MD5 + SALT加密处理的密码
   1. 在utils/constant.js文件内配置SALT。` PWD_SALT: 'admin_imooc_node' `
   2. 安装crypto库。` npm i -S crypto `
   3. 在utils/index.js文件内配置MD5。
   4. 在router/user.js文件内对密码进行加密处理。` password = md5(password + PWD_SALT) `
## 6.使用express-validator进行表单验证
1. 安装express-validator。` npm i -S express-validator `
2. 在router.post方法中使用body声明验证规则并指定提示信息。如` body('username').isString().withMessage('用户名必须为字符串') `
3. 判断返回的错误信息是否为空，当存在错误信息时拿到错误信息并将错误信息使用boom传递到自定义路由异常处理中间件进行处理，不存在错误信息则进行登录操作。` next(boom.badRequest(msg)) `
## 7.生成jwt token
1. 安装jsonwebtoken。` npm i -S jsonwebtoken `
2. 在utils/constant.js文件内配置密钥PRIVATE_KEY和过期时间JWT_EXPIRED。` PRIVATE_KEY: 'bookmanagementsystem', JWT_EXPIRED: 60 * 60 `。此处过期时间设置为1小时，通常过期时间建议不超过24小时，保密性要求高的业务可以设置为1-2小时
3. 调用jwt.sign()生成token。` const token = jwt.sign( { username }, PRIVATE_KEY, { expiresIn: JWT_EXPIRED }) `
4. 在前端发起登录请求，发现token已被成功写入，可将写入的token放到jwt.io网站上进行解析验证
## 8.进行jwt认证
1. 安装express-jwt。` npm i -S express-jwt `
2. 在router/jwt.js文件内配置密钥secret、算法algorithms、校验开关credentialsRequired和白名单路径path。
3. 在router/index.js文件内引入并使用jwt认证中间件，` router.use(jwtAuth) `，并规定token校验失败时的响应` new Result(null, 'Token验证失败', { error: status, errMsg: message }).jwtError(res.status(status)) `
## 9.查询用户信息
1. 在db/index.js文件内定义queryOne()方法
2. 在service/user.js文件内定义findUser()方法，其中调用queryOne()并传入sql语句` select id,username,nickname,role,avatar from admin_user where username='${username}' `，注意此sql语句只查询了需要的内容
3. 在router/user.js文件内的` /info `路由下调用findUser()方法查询用户信息