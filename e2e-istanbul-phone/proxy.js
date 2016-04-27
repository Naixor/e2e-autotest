var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();
var fs = require('fs');
var proxy = require('anyproxy');

!proxy.isRootCAFileExists() && proxy.generateRootCA();

var rule = {
    replaceRequestOption: (req, options) => {
        options.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4';
        return options;
    },
    replaceResponseHeader: (req, res, headers) => {
        // http://yf-model-stream-tm-a00024.yf01.baidu.com:8003/s?tn=iphone&sid=100614&word=160_1:1017,3028 这个链接的服务器会写一个非法的header 'time ',干掉
        if (headers['time ']) {
            headers.time = headers['time '];
            delete headers['time '];
        }
        return headers;
    },
    replaceServerResDataAsync: (req, res, serverResData, callback) => {
        if (req.url === 'http://yf-model-stream-tm-a00024.yf01.baidu.com:8003/s?tn=iphone&sid=100614&word=160_1:1017,3028') {
            var html = serverResData.toString('utf8');
            var fileName = 0;
            html = html.replace(/(\<script.*?\>)([\s\S]+?)\<\/script\>/ig, function (scriptStr, leftTag, jsStr) {
                fileName++;
                fs.writeFile('src/'+ fileName, jsStr);
                var generatedCode = instrumenter.instrumentSync(jsStr, 'src/'+ fileName);
                return leftTag + generatedCode + '</script>';
            });
            return callback(new Buffer(html));
        }
        
        callback(serverResData);
    },
    shouldInterceptHttpsReq :(req) => {
        return true;
    }
};

var options = {
    type          : "http",
    port          : 3334,
    hostname      : "localhost",
    rule          : rule,
    dbFile        : null,  // optional, save request data to a specified file, will use in-memory db if not specified
    webPort       : 8002,  // optional, port for web interface
    socketPort    : 8003,  // optional, internal port for web socket, replace this when it is conflict with your own service
    // throttle      : 10,    // optional, speed limit in kb/s
    disableWebInterface : false, //optional, set it when you don't want to use the web interface
    silent        : false, //optional, do not print anything into terminal. do not set it when you are still debugging.
    interceptHttps: true
};

new proxy.proxyServer(options);