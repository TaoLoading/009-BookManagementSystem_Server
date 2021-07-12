# 书城管理系统后台代码
## 1.技术栈
### 主要使用技术栈为Node.js
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