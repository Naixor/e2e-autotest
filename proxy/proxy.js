var http = require("http");
var https = require("https");
var fs = require("fs");
var net = require("net");
var url = require("url");
var zlib = require('zlib');
var port;

function MiniProxy(options) {
    this.port = options.port || 9393;
    this.onServerError = options.onServerError || function() {};
    this.onBeforeRequest = options.onBeforeRequest || function() {};
    this.onBeforeResponse = options.onBeforeResponse || function() {};
    this.onRequestError = options.onRequestError || function() {};
    this.onRewrite = options.onRewrite || function(buf) {return buf;};
}
MiniProxy.prototype.start = function() {
    var server = http.createServer();

    server.on("request", this.requestHandler);
    server.on("connect", this.connectHandler);

    server.on("error", this.onServerError);
    server.on("beforeRequest", this.onBeforeRequest);
    server.on("beforeResponse", this.onBeforeResponse);
    server.on("requestError", this.onRequestError);
    server.on("rewrite", this.onRewrite);

    server.listen(this.port);
    port = this.port;
};

MiniProxy.prototype.requestHandler = function(req, res) {
    try {
        var self = this; // this -> server
        var path = req.headers.path || url.parse(req.url).path;
        var requestOptions = {
            host: req.headers.host.split(':')[0],
            port: req.headers.host.split(':')[1] || 80,
            path: path,
            method: req.method,
            headers: req.headers,
            body: null,
            encoding: null // gzip encode
        };

        //check url
        if (requestOptions.host == "127.0.0.1" && requestOptions.port == port) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write("ok");
            res.end();
            return;
        }
        var body;
        req.on('data', function (chunk) {
            body += chunk.toString();
        });
        req.on('end', function () {
            requestOptions.body = body;
            self.emit("beforeRequest", requestOptions);
        });
        requestRemote(requestOptions, req, res, self);
        //u can change request param here
    } catch (e) {
        console.log("requestHandlerError" + e.message);
    }
    
    function requestRemote(requestOptions, req, res, proxy) {
        function isJsFile(path) {
            return /\.js$/.test(path);
        }
        var protocol = (!!req.connection.encrypted && !/^http:/.test(req.url)) ? "https" : "http";
        var remoteRequest = null;
        if (isJsFile(requestOptions.path)) {
            remoteRequest = (protocol === 'https' ? https : http).request(requestOptions, function (remoteResponse) {
                // res.writeHead(remoteResponse.statusCode, remoteResponse.headers);
                var headers = {};
                merge(headers, remoteResponse.headers);
                // remoteResponse.setEncoding('utf8');
                var jsFile = [], totalLength = 0;
                remoteResponse.on('data', function (chunk) {
                    totalLength += chunk.length;
                    jsFile.push(chunk);
                });
                remoteResponse.on('end', function () {
                    var buf = {
                        content: Buffer.concat(jsFile, totalLength)
                    };
                    headers['proxy-agent'] = 'Istanbul Proxy 1.0';
                    
                    if (remoteResponse.headers['content-encoding'] && remoteResponse.headers['content-encoding'].indexOf('gzip') !== -1) {
                        zlib.gunzip(buf.content, function (err, buffer) {
                            if (err) {
                                console.log('ungzip error:', err);
                            } else {
                                buf.content = buffer;
                                proxy.emit("rewrite", buf, requestOptions);
                                delete headers['content-encoding'];
                                headers['content-length'] = Buffer.byteLength(buf.content);
                                res.writeHead(remoteResponse.statusCode, headers);
                                res.write(buf.content);                         
                            }
                            res.end();
                        });
                    } else {
                        proxy.emit("rewrite", buf, requestOptions);
                        headers['content-length'] = Buffer.byteLength(buf.content);
                        res.writeHead(remoteResponse.statusCode, headers);
                        res.write(buf.content);
                        res.end();
                    }
                });
            });
            
            remoteRequest.on('error', function(e) {
                proxy.emit("requestError", e, req, res);

                res.writeHead(502, 'Proxy fetch failed');
            });
            remoteRequest.end();

            res.on('close', function() {
                remoteRequest.abort();
            });
        } else {
            remoteRequest = (protocol === 'https' ? https : http).request(requestOptions, function(remoteResponse) {
                remoteResponse.headers['proxy-agent'] = 'Istanbul Proxy 1.0';
                
                proxy.emit("beforeResponse", remoteResponse);

                res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);
                
                remoteResponse.pipe(res);
                res.pipe(remoteResponse);
            });

            remoteRequest.on('error', function(e) {
                proxy.emit("requestError", e, req, res);

                res.writeHead(502, 'Proxy fetch failed');
            });

            req.pipe(remoteRequest);

            res.on('close', function() {
                remoteRequest.abort();
            });
        }
    }

};

function connectRemote(req, requestOptions, socket) {

    var tunnel = net.connect(requestOptions.port, requestOptions.host, function() {
        //format http protocol
        _synReply(socket, 200, 'Connection established', {
                'Connection': 'keep-alive',
                'Proxy-Agent': 'Istanbul Proxy 1.0'
            },
            function(error) {
                if (error) {
                    console.log("syn error", error.message);
                    tunnel.end();
                    socket.end();
                    return;
                }
                // tunnel.setEncoding('utf-8');
                tunnel.pipe(socket);
                socket.pipe(tunnel);
            }
        );
    });

    tunnel.setNoDelay(false);

    tunnel.on('error', function (e) {
        console.log(req.url + " Tunnel error: " + e);
        _synReply(socket, 502, "Tunnel Error", {}, function() {
            try {
                tunnel.destroy();
                socket.end();
            }
            catch(e) {
                console.log('end error' + e.message);
            }
        });
    });

    function _synReply(socket, code, reason, headers, cb) {
        try {
            var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
            var headerLines = '';
            for (var key in headers) {
                headerLines += key + ': ' + headers[key] + '\r\n';
            }
            socket.write(statusLine + headerLines + '\r\n', 'UTF-8', cb);
        } catch (error) {
            cb(error);
        }
    }
}

MiniProxy.prototype.connectHandler = function(req, socket, head) {
    try {
        var self = this;

        var requestOptions = {
            host: req.url.split(':')[0],
            port: req.url.split(':')[1] || 443
        };

        self.emit("beforeRequest", requestOptions);
        connectRemote(req, requestOptions, socket);
    } catch (e) {
        console.log("connectHandler error: " + e.message);
    }

};

function merge(target, source) {
    Object.keys(source).forEach(function (key) {
        target[key] = source[key];
    });
}

module.exports = MiniProxy;