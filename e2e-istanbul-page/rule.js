var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();
var fs = require('fs');

module.exports = {
    replaceServerResDataAsync: function(req,res,serverResData,callback){
        //add "hello github" to all github pages
        // if(req.headers.host == "github.com"){
        //     serverResData += "hello github";
        // }
        if (isJsFile(req.url)) {
            var file_name = /([^/]+\.js)$/.exec(req.url)[1];
            var file_content = serverResData.toString('utf8');
            fs.writeFile('src/'+ file_name, file_content);
            var generatedCode = instrumenter.instrumentSync(file_content, 'src/'+file_name);
            return callback(new Buffer(generatedCode));
        }
        callback(serverResData);
    },

    shouldInterceptHttpsReq :function(req){
        //intercept https://github.com/
        //otherwise, all the https traffic will not go through this proxy
        return true;
    }
};

function isJsFile(path) {
    return /\.js$/.test(path);
}