var http = require('http');
var https = require('https');
var fs = require('fs');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();

function isJsFile(path) {
    return /.js[\s\S]*$/.test(path);
}

var proxy = require('./proxy');
var p = new proxy({
    port: 3334,
    onBeforeRequest: function(requestOptions) {
        console.log("proxy request :" + requestOptions.host + (requestOptions.path || ''));
        console.log(requestOptions.body);
        if (isJsFile(requestOptions.path)) {
            requestOptions.headers['Cache-Control'] = 'no-cache';
        }
    },
    onBeforeResponse: function (responseOptions) {
        responseOptions.headers.time = responseOptions.headers['time '];
        delete responseOptions.headers['time '];
        // console.log(responseOptions.headers, responseOptions.body);
    },
    onRewrite: function (buffer, req) {
        // var file_name = /\/(\S+.js)\S*$/.exec(req.path)[1];
        // if (/jquery/i.test(file_name)) {
        //     return;
        // }
        // // console.log(file_name);
        // var generatedCode = instrumenter.instrumentSync(buffer.content.toString('utf8'), file_name);
        // buffer.content = new Buffer(generatedCode);
    }
});

p.start();
console.log("proxy start");

/** http */
// var url = require('url');
// var server = http.createServer((req, res) => {
//     var path = req.headers.path || url.parse(req.url).path;
//     var requestOptions = {
//         host: req.headers.host.split(':')[0],
//         port: req.headers.host.split(':')[1] || 80,
//         path: path,
//         method: req.method,
//         headers: req.headers,
//         encoding: null // gzip encode
//     };
//     console.log(req.method);
//     var remoteReq = http.request(requestOptions, (remoteRes) => {
//         // remoteRes.pipe(res);
//         res.writeHead(remoteRes.statusCode, remoteRes.headers);
//         // res.pipe(remoteRes);
//         remoteRes.on('data', (chunk) => {
//             res.write(chunk);
//         });
//         remoteRes.on('end', () => {
//             res.end();
//         });
//     });
    
//     remoteReq.end();
    
//     // req.addListener('data', (chunk) => {
//     //     remoteReq.write(chunk);
//     // });
//     // req.addListener('end', () => {
//     //     remoteReq.end();
//     // });  
// });

// server.listen(3333);

/** https */
// var server = https.createServer({
//     key: fs.readFileSync('./keys/server.key'),
//     cert: fs.readFileSync('./keys/server.crt')
// }, (req, res) => {
//     var path = req.headers.path || url.parse(req.url).path;
//     console.log(path);
//     var requestOptions = {
//         host: req.headers.host.split(':')[0],
//         port: req.headers.host.split(':')[1] || 80,
//         path: path,
//         method: req.method,
//         headers: req.headers,
//         encoding: null, // gzip encode
//         // key: req.socket.server.key,
//         // cert: req.socket.server.cert
//     };
//     var remoteReq = https.request(requestOptions, (remoteRes) => {
//         res.writeHead(remoteRes.statusCode, remoteRes.headers);
//         remoteRes.pipe(res);
//         res.pipe(remoteRes);
//     });
//     remoteReq.on('error', console.log);
//     remoteReq.end();
// });

// server.listen(3333);
