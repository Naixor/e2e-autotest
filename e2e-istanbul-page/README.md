# webdriver搭配istanbul实现e2e测试分支覆盖率测试

## 原理

+ 运行代理服务器，拦截http/https请求
+ 在自测case中连接代理服务器
+ 运行自测case，尽管本地并没有源码，但是代理服务器会拦截js代码加好钩子并返回给自测case所打开的浏览器，同时在本地生成一份原始的js文件。拦截js的实现部分在[这里](https://github.com/Naixor/e2e-autotest/blob/master/e2e-istanbul-page/rule.js#L6)
+ case执行完毕，去case中取出`window.__coverage__`，用于覆盖率显示

## 使用

> 首先确保你的环境中装有[`node`](https://nodejs.org/)、[`grunt`](http://www.gruntjs.net/)和[`mocha`](https://mochajs.org/)。 <br>
`node`请参考官网下载或者直接点击[这里](https://nodejs.org/dist/v5.9.1/node-v5.9.1.pkg)下载。<br>
装好`node`后可以直接运行`npm install -g mocha`即可。<br>
`grunt`安装可以直接运行`npm install -g grunt`

> 本例中由于涉及对`https`进行代理，因此代理服务器使用[`anyproxy`](http://anyproxy.io/cn/)，全局安装可使用`npm install -g anyproxy`，其中涉及信任`https`自制证书的流程请移步到`anyproxy`查看具体流程

+ `~$cd e2e-istanbul-page`
+ `e2e-istanbul-page$ npm install`
+ `e2e-istanbul-page$ sudo anyproxy --port 3333 --rule ./rule.js -i`
+ `e2e-istanbul-page$ mocha spec/`
+ `e2e-istanbul-page$ grunt report`
