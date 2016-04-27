# webdriver搭配istanbul实现e2e测试分支覆盖率测试

## 原理

+ 使用`istanbul`对`src`目录下的js源码进行处理加钩子并生成到`prod/src/instrumented`下。
+ 使用`mocha`运行`spec`下的`webdriver`自测case
+ 这时自测脚本所打开的页面引用的是加过钩子的`<script type="text/javascript" src="js/instrumented/main.js"></script>`
+ 代码运行，最后返回页面中的`window.__coverage__`对象
+ 生成覆盖率统计

## 使用

> 首先确保你的环境中装有[`node`](https://nodejs.org/)、[`grunt`](http://www.gruntjs.net/)和[`mocha`](https://mochajs.org/)。 <br>
`node`请参考官网下载或者直接点击[这里](https://nodejs.org/dist/v5.9.1/node-v5.9.1.pkg)下载，装好`node`后可以直接运行`npm install -g mocha`即可。<br>
`grunt`安装可以直接运行`npm install -g grunt`

+ `~$cd e2e-istanbul-localfile`
+ `e2e-istanbul-localfile$ npm install`
+ `e2e-istanbul-localfile$ grunt dev`
+ `e2e-istanbul-localfile$ grunt connect`
+ `e2e-istanbul-localfile$ mocha spec/`
+ `e2e-istanbul-localfile$ grunt report`
